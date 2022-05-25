pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "./Consts.sol";

contract IMP is ERC20Capped {

  event TGEPassed();
  event DistributionEpochFinished(AllocationGroup group, uint256 epoch);

  uint256 public TGETimestamp = 0;
  uint256 amountForPublicSale = 0;

  bool isPublicSaleTokensMinted = false;

  enum AllocationGroup {
    Team, Preseed, Seed, Private, Public, Advisor, Treasury, Partnership, Marketing, Stacking, Ecosystem, Farming, Liquidity
  }

  struct AccountData {
    uint256 balance;
    uint256 index;
    uint8 epoch;
  }

  struct GroupData {
    uint16 unlockPercentage; // Unlock percentage after TGE + unlockTime
    uint256 lockPeriod; // Lock period after TGE
    uint8 vestingEpochs; // Number of epochs for linear vesting
    mapping (address => AccountData) accounts; // Group participants and their balances
    address[] addresses; // We use additional array to be able to iterate over group participants
    uint256 airdropOffset;
    uint8 currentEpoch;
  }

  mapping (AllocationGroup => GroupData) public groups;

  modifier onlyMultisig() {
    require(msg.sender == address(this), "this action is available only via multisig");
    _;
  }
  
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _amountForPublicSale
  ) ERC20(_name, _symbol) ERC20Capped(Consts.cap) {
    // Team
    groups[AllocationGroup.Team].unlockPercentage = Consts.TEAM_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Team].lockPeriod = Consts.TEAM_LOCK_PERIOD;
    groups[AllocationGroup.Team].vestingEpochs = Consts.TEAM_VESTING_EPOCHS;

    // Preseed group
    groups[AllocationGroup.Preseed].unlockPercentage = Consts.PRESEED_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Preseed].lockPeriod = Consts.PRESEED_LOCK_PERIOD;
    groups[AllocationGroup.Preseed].vestingEpochs = Consts.PRESEED_VESTING_EPOCHS;

    // Seed group
    groups[AllocationGroup.Seed].unlockPercentage = Consts.SEED_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Seed].lockPeriod = Consts.SEED_LOCK_PERIOD;
    groups[AllocationGroup.Seed].vestingEpochs = Consts.SEED_VESTING_EPOCHS;

    // Private
    groups[AllocationGroup.Private].unlockPercentage = Consts.PRIVATE_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Private].lockPeriod = Consts.PRIVATE_LOCK_PERIOD;
    groups[AllocationGroup.Private].vestingEpochs = Consts.PRIVATE_VESTING_EPOCHS;

    // Public
    groups[AllocationGroup.Public].unlockPercentage = Consts.PUBLIC_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Public].lockPeriod = Consts.PUBLIC_LOCK_PERIOD;
    groups[AllocationGroup.Public].vestingEpochs = Consts.PUBLIC_VESTING_EPOCHS;

    // Advisor
    groups[AllocationGroup.Advisor].unlockPercentage = Consts.ADVISOR_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Advisor].lockPeriod = Consts.ADVISOR_LOCK_PERIOD;
    groups[AllocationGroup.Advisor].vestingEpochs = Consts.ADVISOR_VESTING_EPOCHS;

    // Treasury
    groups[AllocationGroup.Treasury].unlockPercentage = Consts.TREASURY_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Treasury].lockPeriod = Consts.TREASURY_LOCK_PERIOD;
    groups[AllocationGroup.Treasury].vestingEpochs = Consts.TREASURY_VESTING_EPOCHS;

    // Partnership
    groups[AllocationGroup.Partnership].unlockPercentage = Consts.PARTNERSHIP_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Partnership].lockPeriod = Consts.PARTNERSHIP_LOCK_PERIOD;
    groups[AllocationGroup.Partnership].vestingEpochs = Consts.PARTNERSHIP_VESTING_EPOCHS;

    // Marketing
    groups[AllocationGroup.Marketing].unlockPercentage = Consts.MARKETING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Marketing].lockPeriod = Consts.MARKETING_LOCK_PERIOD;
    groups[AllocationGroup.Marketing].vestingEpochs = Consts.MARKETING_VESTING_EPOCHS;

    // Stacking
    groups[AllocationGroup.Stacking].unlockPercentage = Consts.STAKING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Stacking].lockPeriod = Consts.STAKING_LOCK_PERIOD;
    groups[AllocationGroup.Stacking].vestingEpochs = Consts.STAKING_VESTING_EPOCHS;

    // Ecosystem
    groups[AllocationGroup.Ecosystem].unlockPercentage = Consts.ECOSYSTEM_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Ecosystem].lockPeriod = Consts.ECOSYSTEM_LOCK_PERIOD;
    groups[AllocationGroup.Ecosystem].vestingEpochs = Consts.ECOSYSTEM_VESTING_EPOCHS;

    // Farming
    groups[AllocationGroup.Farming].unlockPercentage = Consts.FARMING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Farming].lockPeriod = Consts.FARMING_LOCK_PERIOD;
    groups[AllocationGroup.Farming].vestingEpochs = Consts.FARMING_VESTING_EPOCHS;

    // Liquidity
    groups[AllocationGroup.Liquidity].unlockPercentage = Consts.LIQUIDITY_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Liquidity].lockPeriod = Consts.LIQUIDITY_LOCK_PERIOD;
    groups[AllocationGroup.Liquidity].vestingEpochs = Consts.LIQUIDITY_VESTING_EPOCHS;

    amountForPublicSale = _amountForPublicSale;
  }

  function mintPublicSaleTokens(address to) public onlyMultisig {
    require(!isPublicSaleTokensMinted, "Tokens for public sale are already minted");
    _mint(to, amountForPublicSale);
    isPublicSaleTokensMinted = true;
  }

  // Adds group participants 
  function addParticipants(AllocationGroup group, address[] memory participants, uint256[] memory balances) public onlyMultisig {
    require(TGETimestamp == 0, "Tokens were already allocated");
    require(participants.length == balances.length, "Participants and balances should have the same length");
    require(participants.length != 0, "There should be at least one participant");

    for (uint256 i=0; i<participants.length; i++) {
      _addParticipant(group, participants[i], balances[i]);
    }
  }

  // Removes participant`s account data and his address from array of addresses
  function removeParticipant(AllocationGroup group, address account) public onlyMultisig {
    require(TGETimestamp == 0, "Tokens were already allocated");

    delete groups[group].addresses[groups[group].accounts[account].index];
    delete groups[group].accounts[account];
  }

  // Sets that TGE is passed
  function setTGEPassed() public onlyMultisig {
    require(TGETimestamp == 0, "TGE is already passed");

    TGETimestamp = block.timestamp;

    emit TGEPassed();
  }

  // Adds new participant if not exists
  function _addParticipant(AllocationGroup group, address account, uint256 balance) internal {
    require(balance > 0 && account != address(0), "Invalid balance or address of user!");
    
    if (groups[group].accounts[account].balance == 0) {
      groups[group].accounts[account].balance = balance;
      groups[group].accounts[account].epoch = 0;
      groups[group].accounts[account].index = groups[group].addresses.length;
      groups[group].addresses.push(account);
    }
  }

  function calculateVestingAmount(address account, AllocationGroup group) internal view returns (uint256) { 
    uint256 pendingTokens = 0;

    if (groups[group].accounts[account].epoch == 0) {
      pendingTokens = groups[group].accounts[account].balance * groups[group].unlockPercentage / 1000;
    } else {
      pendingTokens = groups[group].accounts[account].balance / (groups[group].vestingEpochs - groups[group].accounts[account].epoch + 1);
    }

    return pendingTokens;
  }

  function distribute(AllocationGroup group) public {
    require(TGETimestamp != 0, "Distribution is not started yet");
    require(groups[group].currentEpoch <= groups[group].vestingEpochs, "Distribution is already passed");

    GroupData storage groupData = groups[group];

    require(isAvailablePeriod(
      groupData.currentEpoch,
      groupData.lockPeriod,
      TGETimestamp,
      group
    ), "It's too early for distribution");


    uint256 limit;
    bool isFinalStep;
    if (groupData.airdropOffset + 20 < groupData.addresses.length) {
      // Not final step
      limit = groupData.airdropOffset + 20;
    } else {
      // Final step
      isFinalStep = true;
      limit = groupData.addresses.length;
    }

    for (uint i=groupData.airdropOffset; i<limit; i++) {
      // We distribute if user didn't claim his funds already
      address userAddress = groups[group].addresses[i];
      if (groups[group].accounts[userAddress].epoch <= groupData.currentEpoch && userAddress != address(0)) {
        // Calculate and send funds to user
        uint256 vestingAmount = calculateVestingAmount(userAddress, group);
        _mint(userAddress, vestingAmount);
        
        // Update user epoch
        updateAccountData(userAddress, group, vestingAmount);
      } 
    }
    

    if (isFinalStep) {
      emit DistributionEpochFinished(group, groupData.currentEpoch);
      groupData.currentEpoch += 1;
      groupData.airdropOffset = 0;
    } else {
      groupData.airdropOffset += limit;
    }
  }

  function claim(AllocationGroup group) public {
    require(canClaim(msg.sender, group), "You cannot claim");

    uint256 vestingAmount = calculateVestingAmount(msg.sender, group);

    _mint(msg.sender, vestingAmount);

    updateAccountData(msg.sender, group, vestingAmount);
  }

  function canClaim(address account, AllocationGroup group) internal view returns (bool) {
    AccountData storage accountData = groups[group].accounts[account];
    
    // You cannot claim if your pending balance is 0
    if (accountData.balance == 0) return false;
  
    return isAvailablePeriod(
      accountData.epoch, 
      groups[group].lockPeriod, 
      TGETimestamp,
      group
    );
  }

  function updateAccountData(address account, AllocationGroup group, uint256 vestingAmount) internal {
    AccountData storage accountData = groups[group].accounts[account];
    uint256 amountToUpdate = accountData.balance >= vestingAmount ? vestingAmount : accountData.balance;

    accountData.balance -= amountToUpdate;
    accountData.epoch += 1;
  }

  function getLockedBalance(address account, AllocationGroup group) public view returns(uint256) {
    return groups[group].accounts[account].balance;
  }

  function isAvailablePeriod(
    uint256 epochNumber, 
    uint256 lockPeriod, 
    uint256 initialTimestamp,
    AllocationGroup group
  ) internal view returns (bool) {
    uint256 timeUnit = (group == AllocationGroup.Seed || group == AllocationGroup.Private) ? 1 weeks : 30 days;
    if (group == AllocationGroup.Liquidity) {
      timeUnit = 4 days;
    }
    uint256 availableEpochTimestamp = lockPeriod + (timeUnit * epochNumber) + initialTimestamp;

    return block.timestamp > availableEpochTimestamp;
  }
}

