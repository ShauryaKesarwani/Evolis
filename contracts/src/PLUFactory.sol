// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PLUPair.sol";

/**
 * @title PLUFactory - Factory for creating PLU-enhanced AMM pairs
 * @notice Creates pairs with anti-whale protection and epoch-aware fees
 */
contract PLUFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);
    
    /**
     * @notice Create a new PLU-enhanced pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidityController Address of LiquidityController for epoch tracking
     * @return pair Address of created pair
     */
    function createPair(address tokenA, address tokenB, address liquidityController) external returns (address pair) {
        require(tokenA != tokenB, "PLUFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "PLUFactory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "PLUFactory: PAIR_EXISTS");
        
        // Deploy new PLUPair
        PLUPair pluPair = new PLUPair(token0, token1, liquidityController);
        pair = address(pluPair);
        
        // Register pair
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
    
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
}
