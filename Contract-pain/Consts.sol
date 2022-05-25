pragma solidity ^0.8.3;

library Consts {
    uint256 public constant cap = 3_000_000_000 * (10**18);

    // Unlock percentage
    uint16 public constant TEAM_UNLOCK_PERCENTAGE = 0;
    uint16 public constant PRESEED_UNLOCK_PERCENTAGE = 80;
    uint16 public constant SEED_UNLOCK_PERCENTAGE = 80;
    uint16 public constant PRIVATE_UNLOCK_PERCENTAGE = 80;
    uint16 public constant PUBLIC_UNLOCK_PERCENTAGE = 80;
    uint16 public constant ADVISOR_UNLOCK_PERCENTAGE = 0;
    uint16 public constant TREASURY_UNLOCK_PERCENTAGE = 0;

    uint16 public constant P2E_UNLOCK_PERCENTAGE = 0;
    uint16 public constant LIQUIDITY_UNLOCK_PERCENTAGE = 500;
    uint16 public constant MARKETING_UNLOCK_PERCENTAGE = 50;
    uint16 public constant ECOSYSTEM_UNLOCK_PERCENTAGE = 0;
    uint16 public constant FARMING_UNLOCK_PERCENTAGE = 0;

    // Lock period
    uint256 public constant SEED_LOCK_PERIOD = 3 * 30 days + 9 days;
    uint256 public constant PRIVATE_LOCK_PERIOD = 45 days + 6 days;
    uint256 public constant TEAM_LOCK_PERIOD = 7 * 30 days;
    uint256 public constant ADVISOR_LOCK_PERIOD = 3 * 30 days;
    uint256 public constant P2E_LOCK_PERIOD = 0;
    uint256 public constant LIQUIDITY_LOCK_PERIOD = 0;
    uint256 public constant MARKETING_LOCK_PERIOD = 3 weeks;
    uint256 public constant ECOSYSTEM_LOCK_PERIOD = 4 * 30 days;
    uint256 public constant FARMING_LOCK_PERIOD = 3 * 30 days;

    // Vesting period
    // Weekly epochs
    uint8 public constant SEED_VESTING_EPOCHS = 92;
    uint8 public constant PRIVATE_VESTING_EPOCHS = 80;

    // Monthly epochs
    uint8 public constant TEAM_VESTING_EPOCHS = 25;
    uint8 public constant ADVISOR_VESTING_EPOCHS = 12;
    uint8 public constant P2E_VESTING_EPOCHS = 40;
    uint8 public constant LIQUIDITY_VESTING_EPOCHS = 1;
    uint8 public constant MARKETING_VESTING_EPOCHS = 27;
    uint8 public constant ECOSYSTEM_VESTING_EPOCHS = 40;
    uint8 public constant FARMING_VESTING_EPOCHS = 40;
}