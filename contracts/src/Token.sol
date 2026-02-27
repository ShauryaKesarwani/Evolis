// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Token
 * @notice Simple ERC20 token template deployed by Factory
 */
contract Token is ERC20 {
    address public immutable deployer;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _recipient
    ) ERC20(name, symbol) {
        require(_recipient != address(0), "Invalid recipient");
        deployer = msg.sender;
        _mint(_recipient, totalSupply);
    }
}
