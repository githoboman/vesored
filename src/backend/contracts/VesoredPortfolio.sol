// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VesoredPortfolio
 * @dev On-chain portfolio tracking, transaction ledger, and behavioral risk scoring for BOT Chain.
 * Fully compatible with BOT Chain Mainnet (Chain ID 677) and Bohr Testnet (Chain ID 968).
 */
contract VesoredPortfolio {
    enum TransactionType {
        Buy,
        Sell,
        Deposit,
        Withdrawal
    }

    struct Portfolio {
        uint256 btcBalance;   // Scaled by 1e8 (satoshis)
        uint256 ethBalance;   // Scaled by 1e18 (wei)
        uint256 usdBalance;   // Scaled by 1e6 (cents/micro-USD)
        uint256 botBalance;   // Scaled by 1e18 (native BOT token)
        uint256 lastUpdated;  // Block timestamp
    }

    struct Transaction {
        uint256 timestamp;
        string asset;
        uint256 amount;       // Scaled by asset precision
        TransactionType txType;
    }

    // User address => Portfolio
    mapping(address => Portfolio) private portfolios;
    mapping(address => bool) private hasPortfolio;

    // User address => Transaction history
    mapping(address => Transaction[]) private userTransactions;

    // Static prices for risk calculation fallback (in USD 1e6 scale)
    uint256 public btcPrice = 65420 * 1e6;
    uint256 public ethPrice = 3280 * 1e6;
    uint256 public botPrice = 750000; // $0.75 * 1e6

    address public owner;

    // Events
    event PortfolioUpdated(
        address indexed user,
        uint256 btcBalance,
        uint256 ethBalance,
        uint256 usdBalance,
        uint256 botBalance,
        uint256 timestamp
    );

    event TransactionRecorded(
        address indexed user,
        string asset,
        uint256 amount,
        TransactionType txType,
        uint256 timestamp
    );

    event PricesUpdated(uint256 btcPrice, uint256 ethPrice, uint256 botPrice);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can update prices");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Create or update caller's portfolio balances
     */
    function createOrUpdatePortfolio(
        uint256 _btcBalance,
        uint256 _ethBalance,
        uint256 _usdBalance,
        uint256 _botBalance
    ) external {
        portfolios[msg.sender] = Portfolio({
            btcBalance: _btcBalance,
            ethBalance: _ethBalance,
            usdBalance: _usdBalance,
            botBalance: _botBalance,
            lastUpdated: block.timestamp
        });
        hasPortfolio[msg.sender] = true;

        emit PortfolioUpdated(
            msg.sender,
            _btcBalance,
            _ethBalance,
            _usdBalance,
            _botBalance,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve caller's portfolio
     */
    function getPortfolio() external view returns (Portfolio memory) {
        if (!hasPortfolio[msg.sender]) {
            // Return default mock portfolio if user hasn't initialized
            return Portfolio({
                btcBalance: 124000000,          // 1.24 BTC
                ethBalance: 8650000000000000000,// 8.65 ETH
                usdBalance: 12450000000,        // $12,450.00
                botBalance: 5000000000000000000000, // 5,000 BOT
                lastUpdated: block.timestamp
            });
        }
        return portfolios[msg.sender];
    }

    /**
     * @notice Retrieve a specific user's portfolio
     */
    function getPortfolioOf(address user) external view returns (Portfolio memory) {
        return portfolios[user];
    }

    /**
     * @notice Calculate risk score (0 to 100) based on crypto-to-fiat ratio
     */
    function getRiskScore(address user) public view returns (uint256) {
        Portfolio memory p = portfolios[user];
        if (!hasPortfolio[user]) {
            p = Portfolio({
                btcBalance: 124000000,
                ethBalance: 8650000000000000000,
                usdBalance: 12450000000,
                botBalance: 5000000000000000000000,
                lastUpdated: block.timestamp
            });
        }

        uint256 btcVal = (p.btcBalance * btcPrice) / 1e8;
        uint256 ethVal = (p.ethBalance * ethPrice) / 1e18;
        uint256 botVal = (p.botBalance * botPrice) / 1e18;
        uint256 cryptoVal = btcVal + ethVal + botVal;
        uint256 totalVal = cryptoVal + p.usdBalance;

        if (totalVal == 0) return 30; // Low risk default

        uint256 cryptoRatio = (cryptoVal * 100) / totalVal;
        if (cryptoRatio > 70) {
            return 90; // High risk
        } else if (cryptoRatio > 40) {
            return 60; // Medium risk
        } else {
            return 30; // Low risk
        }
    }

    /**
     * @notice Add a new trade or balance transfer transaction
     */
    function addTransaction(
        string calldata asset,
        uint256 amount,
        TransactionType txType
    ) external {
        Transaction memory newTx = Transaction({
            timestamp: block.timestamp,
            asset: asset,
            amount: amount,
            txType: txType
        });

        userTransactions[msg.sender].push(newTx);

        emit TransactionRecorded(
            msg.sender,
            asset,
            amount,
            txType,
            block.timestamp
        );
    }

    /**
     * @notice Get transaction history for caller
     */
    function getTransactionHistory() external view returns (Transaction[] memory) {
        return userTransactions[msg.sender];
    }

    /**
     * @notice Return reference crypto prices
     */
    function getCryptoPrices() external view returns (uint256, uint256, uint256) {
        return (btcPrice, ethPrice, botPrice);
    }

    /**
     * @notice Owner can update reference prices
     */
    function updatePrices(uint256 _btcPrice, uint256 _ethPrice, uint256 _botPrice) external onlyOwner {
        btcPrice = _btcPrice;
        ethPrice = _ethPrice;
        botPrice = _botPrice;
        emit PricesUpdated(_btcPrice, _ethPrice, _botPrice);
    }
}
