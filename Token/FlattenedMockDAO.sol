// File: contracts/IMintable.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMintable {
  function mint(address _to) external;
}

// File: contracts/MockDAO.sol

pragma solidity ^0.8.0;

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
