pragma solidity ^0.8.0;

import "./Memorial.sol";

contract MockDAO {

    address public tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function setTokenAddress(address _newAddress) public {
        tokenAddress = _newAddress;
    }

    function mint(address _to) public {
        Memorial(tokenAddress).mintMemorial(_to);
    }
}
