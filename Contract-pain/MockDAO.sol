pragma solidity ^0.8.0;

import "./Pain.sol";

contract MockDAO {

    address public tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function setTokenAddress(address _newAddress) public {
        tokenAddress = _newAddress;
    }

    function mint(address _to) public {
        Pain(tokenAddress).mintPain(_to);
    }
}
