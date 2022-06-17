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
        address[] voted;
        TokenType tokenType; 
    }

    enum TokenType { Memorial, Pain }

    TokenType public tokenTypes;

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

    function _mintToken(address _to, bool _tokenType) internal {
        if(_tokenType) {
            IMintable(painContract).mint(_to);
        } else {
            IMintable(memorialContract).mint(_to);
        }
    }

    function propose(TokenType _tokenType, address _to) external {
        //TODO: require for tokentype ?
        require(getBalance(msg.sender, _tokenType), "Propose: msg.sender is not a voter.");
        require(_tokenType >= 0 && _tokenType <= 1, "Propose: invalid token type.");
        address[] memory votedArray;
        Voting memory newVoting = Voting({
            yes: 0,
            no: 0,
            startTime: block.timestamp,
            tokenType: _tokenType,
            to: _to,
            voted: votedArray
        });
        votings[votingCount] = newVoting;
        votingCount++;
    }

    function vote(uint256 _id, bool _vote) external {
        require(getBalance(msg.sender, votings[_id].tokenType), "Vote: you are not a voter.");
        require(!isVoted(msg.sender, votings[_id].tokenType), "Vote: you are already voted."); // TODO: better realization?
        if(_vote){
            votings[_id].yes += getBalance(msg.sender, votings[_id].tokenType);
        } else {
            votings[_id].no += getBalance(msg.sender, votings[_id].tokenType);
        }

        votings[_id].voted.push(msg.sender);
    }

    function execute(uint256 _id) external {
        require(votings[_id].startTime > block.timestamp + 2 days, "Execute: can execute only after 2 days of voting.");
        if(votings[_id].yes > votings[_id].no) {
            _mintToken(votings[_id].to, votings[_id].tokenType);
            emit voteEnded(_id, true);
        } else {
            emit voteEnded(_id, false);
        }
    }

    function getBalance(address _account, TokenType _type) internal view returns (uint256) {
        //TODO: require for tokentype?
        if(_type){
            return Pain(painContract).balanceOf(_account);
        } else {
            return Memorial(memorialContract).balanceOf(_account);
        }
    } 

    function isVoted(uint256 _votingId, address _account) internal view returns (bool) {
        uint256 count = 0;
        for (uint256 i = 0; i < votings[_votingId].voted.length; i++) {
            if(_account == votings[_votingId].voted[i]){
                return true;
            }
        }
        return false;
    } 

}
