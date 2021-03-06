pragma solidity ^0.8.3;

import "./Pain.sol";

contract MultisigPain is Pain {

    event NewProposal(uint256 id);

    struct Proposal {
        address author;
        bytes signatureWithPayload;
        uint256 timestamp;
    }

    address[3] public admins;
    uint256 public proposalsCount;

    mapping (uint256 => Proposal) public proposals; 


    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "msg.sender is not admin");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _amountForPublicSale,
        address[3] memory _admins
    ) Pain(_name, _symbol, _amountForPublicSale) {
        admins = _admins;
    }

    function proposeAddParticipant(AllocationGroup group, address[] memory participants, uint256[] memory balances) public onlyAdmin {
        bytes memory signature = abi.encodeWithSelector(
            this.addParticipants.selector,
            group,
            participants,
            balances
        );

        addProposal(msg.sender, signature);
    }

    function proposeRemoveParticipant(AllocationGroup group, address account) public onlyAdmin {
        bytes memory signature = abi.encodeWithSelector(
            this.removeParticipant.selector,
            group,
            account
        );

        addProposal(msg.sender, signature);
    }

    function proposeSetTGEPassed() public onlyAdmin {
        bytes memory signature = abi.encodeWithSelector(
            this.setTGEPassed.selector
        );

        addProposal(msg.sender, signature);
    }

    function proposeMintForPublicSale(address to) public onlyAdmin {
        bytes memory signature = abi.encodeWithSelector(
            this.mintPublicSaleTokens.selector,
            to
        );

        addProposal(msg.sender, signature);
    }
    

    function confirmProposal(uint256 id) public onlyAdmin {
        require(proposals[id].author != msg.sender, "Author cannot confirm his proposal");
        require(proposals[id].timestamp + 2 days < block.timestamp, "Timelock is not passed");

        (bool success,) = address(this).call(proposals[id].signatureWithPayload);
        require(success, "Proposed action was failed");

        delete proposals[id];
    }

    function isAdmin(address account) internal view returns (bool) {
        return account == admins[0] || account == admins[1] || account == admins[2];
    } 

    function addProposal(address author, bytes memory signatureWithPayload) internal {
        proposals[proposalsCount].author = author;
        proposals[proposalsCount].signatureWithPayload = signatureWithPayload;
        proposals[proposalsCount].timestamp = block.timestamp;

        emit NewProposal(proposalsCount);
        proposalsCount++;
    }

    function proposeSetDAOAddress(address _DAOAddress) public onlyAdmin {
        bytes memory signature = abi.encodeWithSelector(
            this.setDAOAddress.selector,
            _DAOAddress
        );

        addProposal(msg.sender, signature);
    }
}