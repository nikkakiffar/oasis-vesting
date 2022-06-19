pragma solidity ^0.8.0;

import "./IMintable.sol";
import "./Memorial/Memorial.sol";
import "./Pain/Pain.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MockDAO is Ownable {

    event voteEnded(uint256 id, bool isPositive);

    struct Voting {
        uint256 yes;
        uint256 no;
        uint256 startTime;
        address to;
        mapping(address => bool) voted;
        bool isActive;
        TokenType tokenType; 
    }

    enum TokenType { Memorial, Pain }

    uint256 votingCount;
    mapping(uint256 => Voting) public votings;

    address public memorialContract;
    address public painContract;

    constructor(address _memorialContract, address _painContract) {
        memorialContract = _memorialContract;
        painContract = _painContract;
    }

    function setMemorialAddress(address _newAddress) external onlyOwner {
        memorialContract = _newAddress;
    }

    function setPainAddress(address _newAddress) external onlyOwner {
        painContract = _newAddress;
    }

    function _mintToken(address _to, TokenType _tokenType) internal {
        if(_tokenType == TokenType.Pain) {
            IMintable(painContract).mint(_to);
        } else {
            IMintable(memorialContract).mint(_to);
        }
    }

    function propose(TokenType _tokenType, address _to) external onlyOwner {
        require(getBalance(msg.sender, _tokenType) > 0, "Propose: msg.sender is not a voter.");
        
        votings[votingCount].startTime = block.timestamp;
        votings[votingCount].tokenType = _tokenType;
        votings[votingCount].to = _to;
        votings[votingCount].isActive = true;
        
        votingCount++;
    }

    function vote(uint256 _id, bool _vote) external {
        require(getBalance(msg.sender, votings[_id].tokenType) > 0, "Vote: you are not a voter.");
        require(!votings[_id].voted[msg.sender], "Vote: you are already voted.");
        require(votings[_id].isActive, "Vote: voting is not active.");
        if(_vote){
            votings[_id].yes += getBalance(msg.sender, votings[_id].tokenType);
        } else {
            votings[_id].no += getBalance(msg.sender, votings[_id].tokenType);
        }

        votings[_id].voted[msg.sender] = true;
    }

    function execute(uint256 _id) external {
        require(votings[_id].startTime > block.timestamp + 2 days, "Execute: can execute only after 2 days of voting.");
        require(votings[_id].isActive, "Execute: voting is not active.");
        if(votings[_id].yes > votings[_id].no) {
            _mintToken(votings[_id].to, votings[_id].tokenType);
            emit voteEnded(_id, true);
        } else {
            emit voteEnded(_id, false);
        }
        votings[_id].isActive = false;
    }

    function getBalance(address _account, TokenType _type) internal view returns (uint256) {
        if(_type == TokenType.Pain){
            return Pain(painContract).balanceOf(_account);
        } else {
            return Memorial(memorialContract).balanceOf(_account);
        }
    } 

}