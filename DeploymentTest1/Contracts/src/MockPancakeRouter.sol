// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockPancakeRouter
 * @notice Mock router for Ganache testing
 * @dev Simulates PancakeSwap router for local development
 */
contract MockPancakeRouter {
    event LiquidityAdded(
        address indexed token,
        uint256 tokenAmount,
        uint256 ethAmount,
        address indexed to
    );
    
    event TokensPurchased(
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    
    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 ethAmount
    );
    
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        require(deadline >= block.timestamp, "Expired");
        require(msg.value > 0, "No ETH");
        require(amountTokenDesired > 0, "No tokens");
        
        // Transfer tokens from sender to this contract (simulating LP pool)
        IERC20(token).transferFrom(msg.sender, address(this), amountTokenDesired);
        
        // Mock LP token amount
        liquidity = msg.value + amountTokenDesired;
        
        emit LiquidityAdded(token, amountTokenDesired, msg.value, to);
        
        return (amountTokenDesired, msg.value, liquidity);
    }
    
    /**
     * @notice Buy tokens with ETH (mock swap)
     * @dev Simple mock: 1 ETH = 10,000 tokens (adjust ratio as needed)
     */
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(msg.value > 0, "No ETH sent");
        require(path.length == 2, "Invalid path");
        
        address token = path[1];
        
        // Mock exchange rate: 1 ETH = 10,000 tokens
        uint256 tokensOut = msg.value * 10000;
        require(tokensOut >= amountOutMin, "Insufficient output amount");
        
        // Check router has enough tokens
        require(IERC20(token).balanceOf(address(this)) >= tokensOut, "Insufficient liquidity");
        
        // Transfer tokens to buyer
        IERC20(token).transfer(to, tokensOut);
        
        emit TokensPurchased(to, msg.value, tokensOut);
        
        amounts = new uint256[](2);
        amounts[0] = msg.value;
        amounts[1] = tokensOut;
        
        return amounts;
    }
    
    /**
     * @notice Sell tokens for ETH (mock swap)
     * @dev Simple mock: 10,000 tokens = 1 ETH
     */
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(amountIn > 0, "No tokens sent");
        require(path.length == 2, "Invalid path");
        
        address token = path[0];
        
        // Transfer tokens from seller to router
        IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        
        // Mock exchange rate: 10,000 tokens = 1 ETH
        uint256 ethOut = amountIn / 10000;
        require(ethOut >= amountOutMin, "Insufficient output amount");
        require(address(this).balance >= ethOut, "Insufficient ETH liquidity");
        
        // Transfer ETH to seller
        (bool success, ) = to.call{value: ethOut}("");
        require(success, "ETH transfer failed");
        
        emit TokensSold(to, amountIn, ethOut);
        
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = ethOut;
        
        return amounts;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
