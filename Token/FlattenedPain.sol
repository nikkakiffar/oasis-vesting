// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// File: @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/token/ERC20/ERC20.sol


// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;



/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}

// File: @openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/ERC20Capped.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of {ERC20} that adds a cap to the supply of tokens.
 */
abstract contract ERC20Capped is ERC20 {
    uint256 private immutable _cap;

    /**
     * @dev Sets the value of the `cap`. This value is immutable, it can only be
     * set once during construction.
     */
    constructor(uint256 cap_) {
        require(cap_ > 0, "ERC20Capped: cap is 0");
        _cap = cap_;
    }

    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view virtual returns (uint256) {
        return _cap;
    }

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount) internal virtual override {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }
}

// File: contracts/Pain/PainConsts.sol

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

// File: contracts/IMintable.sol

pragma solidity ^0.8.0;

interface IMintable {
  function mint(address _to) external;
}

// File: contracts/Pain/Pain.sol

pragma solidity ^0.8.3;



contract Pain is ERC20Capped, IMintable {

  event TGEPassed();
  event DistributionEpochFinished(AllocationGroup group, uint256 epoch);

  // Address of MockDAO 
  address DAOAddress;

  uint256 public TGETimestamp = 0;
  uint256 amountForPublicSale = 0;

  bool isPublicSaleTokensMinted = false;

  enum AllocationGroup {
    Preseed, Seed, Private, Public, Advisor, Treasury, Partnership, Marketing, Staking, Ecosystem, Farming, Liquidity
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
  ) ERC20(_name, _symbol) ERC20Capped(PainConsts.cap) {
    // Preseed group
    groups[AllocationGroup.Preseed].unlockPercentage = PainConsts.PRESEED_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Preseed].lockPeriod = PainConsts.PRESEED_LOCK_PERIOD;
    groups[AllocationGroup.Preseed].vestingEpochs = PainConsts.PRESEED_VESTING_EPOCHS;

    // Seed group
    groups[AllocationGroup.Seed].unlockPercentage = PainConsts.SEED_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Seed].lockPeriod = PainConsts.SEED_LOCK_PERIOD;
    groups[AllocationGroup.Seed].vestingEpochs = PainConsts.SEED_VESTING_EPOCHS;

    // Private
    groups[AllocationGroup.Private].unlockPercentage = PainConsts.PRIVATE_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Private].lockPeriod = PainConsts.PRIVATE_LOCK_PERIOD;
    groups[AllocationGroup.Private].vestingEpochs = PainConsts.PRIVATE_VESTING_EPOCHS;

    // Public
    groups[AllocationGroup.Public].unlockPercentage = PainConsts.PUBLIC_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Public].lockPeriod = PainConsts.PUBLIC_LOCK_PERIOD;
    groups[AllocationGroup.Public].vestingEpochs = PainConsts.PUBLIC_VESTING_EPOCHS;

    // Advisor
    groups[AllocationGroup.Advisor].unlockPercentage = PainConsts.ADVISOR_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Advisor].lockPeriod = PainConsts.ADVISOR_LOCK_PERIOD;
    groups[AllocationGroup.Advisor].vestingEpochs = PainConsts.ADVISOR_VESTING_EPOCHS;

    // Treasury
    groups[AllocationGroup.Treasury].unlockPercentage = PainConsts.TREASURY_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Treasury].lockPeriod = PainConsts.TREASURY_LOCK_PERIOD;
    groups[AllocationGroup.Treasury].vestingEpochs = PainConsts.TREASURY_VESTING_EPOCHS;

    // Partnership
    groups[AllocationGroup.Partnership].unlockPercentage = PainConsts.PARTNERSHIP_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Partnership].lockPeriod = PainConsts.PARTNERSHIP_LOCK_PERIOD;
    groups[AllocationGroup.Partnership].vestingEpochs = PainConsts.PARTNERSHIP_VESTING_EPOCHS;

    // Marketing
    groups[AllocationGroup.Marketing].unlockPercentage = PainConsts.MARKETING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Marketing].lockPeriod = PainConsts.MARKETING_LOCK_PERIOD;
    groups[AllocationGroup.Marketing].vestingEpochs = PainConsts.MARKETING_VESTING_EPOCHS;

    // Staking
    groups[AllocationGroup.Staking].unlockPercentage = PainConsts.STAKING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Staking].lockPeriod = PainConsts.STAKING_LOCK_PERIOD;
    groups[AllocationGroup.Staking].vestingEpochs = PainConsts.STAKING_VESTING_EPOCHS;

    // Ecosystem
    groups[AllocationGroup.Ecosystem].unlockPercentage = PainConsts.ECOSYSTEM_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Ecosystem].lockPeriod = PainConsts.ECOSYSTEM_LOCK_PERIOD;
    groups[AllocationGroup.Ecosystem].vestingEpochs = PainConsts.ECOSYSTEM_VESTING_EPOCHS;

    // Farming
    groups[AllocationGroup.Farming].unlockPercentage = PainConsts.FARMING_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Farming].lockPeriod = PainConsts.FARMING_LOCK_PERIOD;
    groups[AllocationGroup.Farming].vestingEpochs = PainConsts.FARMING_VESTING_EPOCHS;

    // Liquidity
    groups[AllocationGroup.Liquidity].unlockPercentage = PainConsts.LIQUIDITY_UNLOCK_PERCENTAGE;
    groups[AllocationGroup.Liquidity].lockPeriod = PainConsts.LIQUIDITY_LOCK_PERIOD;
    groups[AllocationGroup.Liquidity].vestingEpochs = PainConsts.LIQUIDITY_VESTING_EPOCHS;

    amountForPublicSale = _amountForPublicSale;
  }

  function mintPublicSaleTokens(address to) public onlyMultisig {
    require(!isPublicSaleTokensMinted, "Tokens for public sale are already minted");
    _mint(to, amountForPublicSale);
    isPublicSaleTokensMinted = true;
  }

  // Sets address of Mock DAO
  function setDAOAddress(address _DAOAddress) public onlyMultisig {
    DAOAddress = _DAOAddress;
  }

  function mint(address _to) public override{
    require(DAOAddress == msg.sender, "mintMemorial: Invalid DAO address");
    uint256 amountForMintMemorial = PainConsts.cap / 1000 / (10**18);
    _mint(_to, amountForMintMemorial);
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
