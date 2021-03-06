pragma solidity ^0.8.3;

library PainConsts {
    uint256 public constant cap = 15_000_000_000 * (10**18);

    // Unlock percentage (100% = 1000 if you need float percentage like 5,5)
    uint16 public constant PRESEED_UNLOCK_PERCENTAGE = 50;
    uint16 public constant SEED_UNLOCK_PERCENTAGE = 50;
    uint16 public constant PRIVATE_UNLOCK_PERCENTAGE = 100;
    uint16 public constant PUBLIC_UNLOCK_PERCENTAGE = 200;
    uint16 public constant ADVISOR_UNLOCK_PERCENTAGE = 0;
    uint16 public constant TREASURY_UNLOCK_PERCENTAGE = 0;
    uint16 public constant PARTNERSHIP_UNLOCK_PERCENTAGE = 0;
    uint16 public constant MARKETING_UNLOCK_PERCENTAGE = 50;
    uint16 public constant STAKING_UNLOCK_PERCENTAGE = 50;
    uint16 public constant ECOSYSTEM_UNLOCK_PERCENTAGE = 50;
    uint16 public constant FARMING_UNLOCK_PERCENTAGE = 50;
    uint16 public constant LIQUIDITY_UNLOCK_PERCENTAGE = 1000;

    // Lock period
    uint256 public constant PRESEED_LOCK_PERIOD = 0;
    uint256 public constant SEED_LOCK_PERIOD = 0;
    uint256 public constant PRIVATE_LOCK_PERIOD = 30 days;
    uint256 public constant PUBLIC_LOCK_PERIOD = 0;
    uint256 public constant ADVISOR_LOCK_PERIOD = 3 * 30 days;
    uint256 public constant TREASURY_LOCK_PERIOD = 3 * 30 days;
    uint256 public constant PARTNERSHIP_LOCK_PERIOD = 30 days;
    uint256 public constant MARKETING_LOCK_PERIOD = 0;
    uint256 public constant STAKING_LOCK_PERIOD = 0;
    uint256 public constant ECOSYSTEM_LOCK_PERIOD = 0;
    uint256 public constant FARMING_LOCK_PERIOD = 0;
    uint256 public constant LIQUIDITY_LOCK_PERIOD = 0;

    // Vesting period
    // Monthly epochs
    uint8 public constant PRESEED_VESTING_EPOCHS = 12;
    uint8 public constant SEED_VESTING_EPOCHS = 12;
    uint8 public constant PRIVATE_VESTING_EPOCHS = 9;
    uint8 public constant PUBLIC_VESTING_EPOCHS = 3;
    uint8 public constant ADVISOR_VESTING_EPOCHS = 12;
    uint8 public constant TREASURY_VESTING_EPOCHS = 12;
    uint8 public constant PARTNERSHIP_VESTING_EPOCHS = 12;
    uint8 public constant MARKETING_VESTING_EPOCHS = 3;
    uint8 public constant STAKING_VESTING_EPOCHS = 3;
    uint8 public constant ECOSYSTEM_VESTING_EPOCHS = 9;
    uint8 public constant FARMING_VESTING_EPOCHS = 9;
    uint8 public constant LIQUIDITY_VESTING_EPOCHS = 0;
}