// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PLUPair - Progressive Liquidity Unlock AMM Pair with Anti-Whale Protection
 * @notice Custom AMM pair that implements:
 * - Dynamic fees based on trade size (whale protection)
 * - Epoch-aware fee reduction (early = higher fees)
 * - Compatible with UniswapV2 Router interface
 */
contract PLUPair is ReentrancyGuard {
    // Core AMM state
    address public token0;
    address public token1;
    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;
    
    uint256 public kLast; // reserve0 * reserve1 after most recent liquidity event
    
    // LP token state
    string public constant name = "PLU LP Token";
    string public constant symbol = "PLU-LP";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // PLU-specific state
    address public liquidityController;
    uint256 public deploymentTime;
    uint256 public constant EPOCH_DURATION = 1 days;
    uint256 public constant TOTAL_EPOCHS = 30;
    
    // Anti-pump-and-dump protection
    uint256 public constant COOLDOWN_PERIOD = 5 minutes; // Min time between buy and sell
    uint256 public constant MAX_SELLS_PER_HOUR = 3; // Limit rapid selling
    mapping(address => uint256) public lastBuyTime;
    mapping(address => uint256) public lastSellTime;
    mapping(address => uint256) public sellCountInHour;
    mapping(address => uint256) public hourStartTime;
    
    // Fee configuration (basis points, 10000 = 100%)
    uint256 public constant BASE_FEE = 30; // 0.3% base fee (reasonable for all)
    uint256 public constant MAX_FEE = 230; // 2.3% max fee for whales (base + 2%)
    uint256 public constant MIN_FEE = 20; // 0.2% min fee after maturity
    
    // Whale thresholds (percentage of reserves)
    uint256 public constant WHALE_THRESHOLD_1 = 200; // 2% of reserves
    uint256 public constant WHALE_THRESHOLD_2 = 500; // 5% of reserves
    uint256 public constant WHALE_THRESHOLD_3 = 1000; // 10% of reserves
    
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to,
        uint256 feeApplied
    );
    event Sync(uint112 reserve0, uint112 reserve1);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event PumpAndDumpDetected(address indexed trader, uint256 penaltyBPS, string reason);
    
    constructor(address _token0, address _token1, address _liquidityController) {
        token0 = _token0;
        token1 = _token1;
        liquidityController = _liquidityController;
        deploymentTime = block.timestamp;
    }
    
    /**
     * @notice Calculate dynamic fee based on trade size and epoch
     * @param amountIn Input amount
     * @param reserveIn Reserve of input token
     * @return fee Fee in basis points (10000 = 100%)
     */
    function calculateDynamicFee(uint256 amountIn, uint256 reserveIn) public view returns (uint256 fee) {
        // Step 1: Calculate trade size as percentage of reserves (in basis points)
        uint256 tradePercentage = (amountIn * 10000) / reserveIn;
        
        // Step 2: Simplified fee structure - more reasonable for all users
        uint256 sizeFee;
        if (tradePercentage <= WHALE_THRESHOLD_1) {
            // Normal trade: <= 2% of reserves → 0.3% fee
            sizeFee = BASE_FEE;
        } else if (tradePercentage <= WHALE_THRESHOLD_2) {
            // Medium trade: 2-5% of reserves → 0.6% fee (2x base)
            sizeFee = BASE_FEE * 2;
        } else if (tradePercentage <= WHALE_THRESHOLD_3) {
            // Large trade: 5-10% of reserves → 1.2% fee (4x base)
            sizeFee = BASE_FEE * 4;
        } else {
            // Whale trade: >10% of reserves → gradual increase to 2.3% max
            // Linear scaling from 1.2% to 2.3%
            uint256 excessPercentage = tradePercentage - WHALE_THRESHOLD_3;
            uint256 additionalFee = (excessPercentage * (MAX_FEE - BASE_FEE * 4)) / 1000;
            sizeFee = BASE_FEE * 4 + additionalFee;
            if (sizeFee > MAX_FEE) sizeFee = MAX_FEE;
        }
        
        // Step 3: Apply epoch-based reduction (mature projects get lower fees)
        uint256 currentEpoch = getCurrentEpoch();
        if (currentEpoch >= TOTAL_EPOCHS) {
            // Fully matured: reduce to minimum fee (0.2%)
            fee = MIN_FEE + ((sizeFee - MIN_FEE) * 30) / 100; // 70% discount
        } else {
            // Progressive discount: 0% at epoch 0, 40% at epoch 30
            uint256 epochDiscount = (currentEpoch * 40) / TOTAL_EPOCHS;
            fee = sizeFee - ((sizeFee - MIN_FEE) * epochDiscount) / 100;
        }
        
        // Step 4: Ensure fee stays within bounds
        if (fee < MIN_FEE) fee = MIN_FEE;
        if (fee > MAX_FEE) fee = MAX_FEE;
        
        return fee;
    }
    
    /**
     * @notice Get current epoch since deployment
     */
    function getCurrentEpoch() public view returns (uint256) {
        if (block.timestamp < deploymentTime) return 0;
        uint256 elapsed = block.timestamp - deploymentTime;
        uint256 epoch = elapsed / EPOCH_DURATION;
        return epoch > TOTAL_EPOCHS ? TOTAL_EPOCHS : epoch;
    }
    
    /**
     * @notice Check if address is attempting pump-and-dump
     * @param trader Address to check
     * @param isBuy Whether this is a buy (true) or sell (false)
     * @return allowed Whether trade is allowed
     * @return penaltyBPS Additional penalty in basis points if suspicious
     */
    function checkPumpAndDump(address trader, bool isBuy) internal returns (bool allowed, uint256 penaltyBPS) {
        // Reset sell counter if hour has passed
        if (block.timestamp >= hourStartTime[trader] + 1 hours) {
            sellCountInHour[trader] = 0;
            hourStartTime[trader] = block.timestamp;
        }
        
        if (isBuy) {
            // Record buy time
            lastBuyTime[trader] = block.timestamp;
            return (true, 0);
        } else {
            // This is a sell - check for pump-and-dump pattern
            
            // Check 1: Cooldown period - can't sell immediately after buying
            if (lastBuyTime[trader] > 0 && block.timestamp < lastBuyTime[trader] + COOLDOWN_PERIOD) {
                // Too quick after buying - apply heavy penalty
                emit PumpAndDumpDetected(trader, 500, "Quick flip detected");
                return (true, 500); // +5% penalty for quick flip
            }
            
            // Check 2: Rapid selling detection
            sellCountInHour[trader]++;
            if (sellCountInHour[trader] > MAX_SELLS_PER_HOUR) {
                // Too many sells in short time - apply penalty
                emit PumpAndDumpDetected(trader, 300, "Rapid selling detected");
                return (true, 300); // +3% penalty for spam selling
            }
            
            lastSellTime[trader] = block.timestamp;
            return (true, 0); // Normal sell
        }
    }
    
    /**
     * @notice Add liquidity to the pair
     * @return liquidity LP tokens minted
     */
    function mint(address to) external nonReentrant returns (uint256 liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;
        
        if (totalSupply == 0) {
            // Initial liquidity
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            // Subsequent liquidity
            liquidity = min(
                (amount0 * totalSupply) / _reserve0,
                (amount1 * totalSupply) / _reserve1
            );
        }
        
        require(liquidity > 0, "PLUPair: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity);
        
        _update(balance0, balance1, _reserve0, _reserve1);
        kLast = uint256(reserve0) * reserve1;
        
        emit Mint(msg.sender, amount0, amount1);
    }
    
    /**
     * @notice Remove liquidity from the pair
     * @return amount0 Amount of token0 returned
     * @return amount1 Amount of token1 returned
     */
    function burn(address to) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        address _token0 = token0;
        address _token1 = token1;
        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));
        uint256 liquidity = balanceOf[address(this)];
        
        amount0 = (liquidity * balance0) / totalSupply;
        amount1 = (liquidity * balance1) / totalSupply;
        require(amount0 > 0 && amount1 > 0, "PLUPair: INSUFFICIENT_LIQUIDITY_BURNED");
        
        _burn(address(this), liquidity);
        IERC20(_token0).transfer(to, amount0);
        IERC20(_token1).transfer(to, amount1);
        
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        
        _update(balance0, balance1, _reserve0, _reserve1);
        kLast = uint256(reserve0) * reserve1;
        
        emit Burn(msg.sender, amount0, amount1, to);
    }
    
    /**
     * @notice Swap tokens with dynamic anti-whale fees
     * @param amount0Out Amount of token0 to send out
     * @param amount1Out Amount of token1 to send out
     * @param to Recipient address
     */
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "PLUPair: INSUFFICIENT_OUTPUT_AMOUNT");
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, "PLUPair: INSUFFICIENT_LIQUIDITY");
        
        // Determine if this is a buy or sell (simplified: if getting token0 out, it's a sell of token0)
        // In reality, one token is the project token and other is BNB/stablecoin
        // For this example, assume token0 is the project token
        bool isSellOfToken0 = amount0Out > 0;
        
        // Check for pump-and-dump behavior
        (bool allowed, uint256 pumpDumpPenalty) = checkPumpAndDump(to, !isSellOfToken0);
        require(allowed, "PLUPair: Trade not allowed");
        
        // Transfer output tokens
        if (amount0Out > 0) IERC20(token0).transfer(to, amount0Out);
        if (amount1Out > 0) IERC20(token1).transfer(to, amount1Out);
        
        // Calculate input amounts
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        
        uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "PLUPair: INSUFFICIENT_INPUT_AMOUNT");
        
        // Calculate dynamic fee based on trade size
        uint256 feeRate;
        if (amount0In > 0) {
            feeRate = calculateDynamicFee(amount0In, _reserve0);
        } else {
            feeRate = calculateDynamicFee(amount1In, _reserve1);
        }
        
        // Apply pump-and-dump penalty (if any)
        feeRate = feeRate + pumpDumpPenalty;
        if (feeRate > 1000) feeRate = 1000; // Cap at 10% total
        
        // Apply dynamic fee to invariant check
        uint256 balance0Adjusted = (balance0 * 10000) - (amount0In * feeRate);
        uint256 balance1Adjusted = (balance1 * 10000) - (amount1In * feeRate);
        
        require(
            balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * uint256(_reserve1) * (10000 ** 2),
            "PLUPair: K"
        );
        
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to, feeRate);
    }
    
    /**
     * @notice Force reserves to match balances
     */
    function skim(address to) external nonReentrant {
        address _token0 = token0;
        address _token1 = token1;
        IERC20(_token0).transfer(to, IERC20(_token0).balanceOf(address(this)) - reserve0);
        IERC20(_token1).transfer(to, IERC20(_token1).balanceOf(address(this)) - reserve1);
    }
    
    /**
     * @notice Force balances to match reserves
     */
    function sync() external nonReentrant {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this)),
            reserve0,
            reserve1
        );
    }
    
    /**
     * @notice Get current reserves
     */
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
    
    // Internal functions
    
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "PLUPair: OVERFLOW");
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }
    
    function _mint(address to, uint256 value) private {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
    
    function _burn(address from, uint256 value) private {
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Transfer(from, address(0), value);
    }
    
    // LP Token functions
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= value;
        }
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
    
    // Math helpers
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
    
    // Allow contract to receive ETH/BNB
    receive() external payable {}
}
