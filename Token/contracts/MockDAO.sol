pragma solidity ^0.8.0;

import "./IMintable.sol";
import "./Memorial/Memorial.sol";
import "./Pain/Pain.sol";

contract MockDAO {

    event voteEnded(uint256 id, bool isPositive);

    struct Voting {
        uint256 yes;
        uint256 no;
        bool tokenType; // 0: memorial, 1: pain
        address to;
        address[] voted;
    }

    uint256 votingCount;
    mapping(uint256 => Voting) public votings;

    address public memorialContract;
    address public painContract;

    constructor(address _memorialContract, address _painContract) {
        memorialContract = _memorialContract;
        painContract = _painContract;
    }

    function setMemorialAddress(address _newAddress) external {
        memorialContract = _newAddress;
    }

    function setPainAddress(address _newAddress) external {
        painContract = _newAddress;
    }

    function _mintToken(address _to, bool _tokenType) internal {
        if(_tokenType) {
            IMintable(painContract).mint(_to);
        } else {
            IMintable(memorialContract).mint(_to);
        }
    }

    function propose(bool _tokenType, address _to) external {
        require(getBalance(msg.sender, _tokenType), "onlyVoter: msg.sender is not a voter.");
        address[] memory votedArray;
        Voting memory newVoting = Voting({
            yes: 0,
            no: 0,
            tokenType: _tokenType,
            to: _to,
            voted: votedArray
        });
        votings[votingCount] = newVoting;
        votingCount++;
    }

    function vote(uint256 _id, bool _vote) external {
        require(getBalance(msg.sender, votings[_id].tokenType), "onlyVoter: msg.sender is not a voter.");
        if(_vote){
            votings[_id].yes += getBalance(msg.sender, votings[_id].tokenType);
        } else {
            votings[_id].no += getBalance(msg.sender, votings[_id].tokenType);
        }

        votings[_id].voted.push(msg.sender);
    }

    function execute(uint256 _id) external {
        require(getBalance(msg.sender, votings[_id].tokenType), "onlyVoter: msg.sender is not a voter.");
        if(votings[_id].yes > votings[_id].no) {
            _mintToken(votings[_id].to, votings[_id].tokenType);
            emit voteEnded(_id, true);
        } else {
            emit voteEnded(_id, false);
        }
    }

    function getBalance(address _account, bool _type) internal view returns (bool) {
        if(_type){
            return Pain(painContract).balanceOf(_account);
        } else {
            return Memorial(memorialContract).balanceOf(_account);
        }
    } 

}
