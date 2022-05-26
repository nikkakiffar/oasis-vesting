pragma solidity ^0.8.0;

import "./IMintable.sol";

contract MockDAO {

    address public memorialContract;
    address public painContract;

    constructor(address _memorialContract, address _painContract) {
        memorialContract = _memorialContract;
        painContract = _painContract;
    }

    function setMemorialAddress(address _newAddress) public {
        memorialContract = _newAddress;
    }

    function setPainAddress(address _newAddress) public {
        painContract = _newAddress;
    }

    function mintMemorial(address _to) public {
        IMintable(memorialContract).mint(_to);
    }
    
    function mintPain(address _to) public {
        IMintable(painContract).mint(_to);
    }
}
