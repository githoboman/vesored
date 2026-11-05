# Vesored Whitepaper & Ecosystem Pitch Deck
**AI-Powered Behavioral Portfolio Analytics & Real-Time Risk Engine on BOT Chain**

*Version 1.0 — October 2026*  
*Official Repository:* [https://github.com/githoboman/vesored](https://github.com/githoboman/vesored)  
*Target Network:* BOT Chain (Bohr Testnet & BOT Mainnet)

---

## 1. Executive Summary

**Vesored** is an AI-driven behavioral portfolio analytics and risk management protocol natively deployed on **BOT Chain** (EVM Layer 1 for DePIN and AI applications). 

In modern decentralized finance and algorithmic trading, over 80% of retail and institutional capital loss stems not from technical exploits, but from behavioral missteps: revenge trading, FOMO-induced overexposure, asymmetric risk allocation, and lack of real-time telemetry. Existing portfolio trackers are passive, delayed, and chain-agnostic dashboards that offer zero preventative risk controls.

Vesored resolves this by combining:
1. **On-Chain Behavioral Risk Engine**: Real-time algorithmic scoring (0–100) assessing crypto-to-stablecoin ratios, asset volatility exposure, and portfolio concentration.
2. **Sub-Second Real-Time Telemetry**: Leveraging BOT Chain's ~0.75-second block confirmation times for instantaneous trade journaling and portfolio rebalancing alerts.
3. **Smart Contract-Enforced Portfolio State**: Deploying verifiable on-chain state (`VesoredPortfolio.sol`) where user balances, transaction history, and behavioral scores are permanently ledgered with ultra-low gas overhead (~$0.06/tx).
4. **Adaptive User Interface**: Seamless dual-mode interface offering "Beginner Guardrails" (simplified risk mitigation) and "Professional Terminal" modes for advanced traders.

---

## 2. Why BOT Chain?

Vesored was purpose-built and fully migrated to **BOT Chain** to take full advantage of its Layer 1 architecture optimized for high-throughput AI and DePIN workloads:

| BOT Chain Advantage | Vesored Protocol Benefit |
| :--- | :--- |
| **100% EVM Compatibility** | Full compatibility with Solidity (`^0.8.20`), Hardhat, MetaMask, BO Wallet, and standard Web3 toolchains. |
| **Sub-Second Finality (~0.75s)** | Enables instantaneous risk evaluation before, during, and after trade executions. Eliminates latency slippage. |
| **Ultra-Low Transaction Fees (~$0.06)** | Allows frequent on-chain portfolio updates, trade ledgering, and rebalance triggers without prohibitive gas costs. |
| **Native Utility ($BOT / $tBOT)** | Native integration with $BOT token for gas consumption, automated fee rebates, and ecosystem rewards. |
| **Dual-Chain Infrastructure** | Production ready for both Bohr Testnet (Chain ID `968`) and BOT Chain Mainnet (Chain ID `677`). |

---

## 3. System Architecture & Smart Contracts

### 3.1 Smart Contract Layer (`VesoredPortfolio.sol`)
The core contract is deployed on **BOT Chain Bohr Testnet** at:
`0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
*(Transaction Hash: `0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68`, Block: `27099023`)*

Key on-chain functions:
- `createOrUpdatePortfolio(uint256 btc, uint256 eth, uint256 usd, uint256 bot)`: Atomic on-chain balance management.
- `getRiskScore(address user)`: Deterministic on-chain risk score calculation factoring asset concentration and volatility ratios.
- `addTransaction(string asset, uint256 amount, uint8 txType)`: Immutable transaction ledgering directly on BOT Chain blocks.
- `getTransactionHistory()`: Gas-optimized retrieval of user trade and balance action history.
- `getCryptoPrices()`: Reference price feeds for on-chain valuation.

### 3.2 Frontend & Web3 Provider Layer
- Built with React, TypeScript, Vite, TailwindCSS, and Radix UI primitives.
- Native EIP-1193 provider integration supporting **MetaMask**, **BO Wallet**, **Rabby**, and injected EVM wallets.
- **Instant Demo Account Mode**: Allows 1-click testnet preview and live RPC query exploration without requiring browser extensions.
- Automated `wallet_addEthereumChain` and `wallet_switchEthereumChain` for seamless onboarding to Chain ID `968` (Bohr) and `677` (Mainnet).

---

## 4. Ecosystem Incentive Alignment (Support Tiers)

Vesored is applying for the **BOT Chain Ecosystem Support & Incentive Program**:

- **Primary Application Option: Option C (Community Growth Support) & Option A (DEX Liquidity Support)**
  - *Option C*: Accelerates active on-chain user growth through automated portfolio tracking, behavioral risk challenges, and points-based engagement rewards.
  - *Option A*: Incentivizes LP depth and organic trading volume on BOT Chain's native DEX (`https://dex.botchain.ai`) for $BOT and wrapped synthetic pairs.
- **Gas Rebate Synergy**: With frequent portfolio updates and trade journaling, Vesored generates high-frequency, organic, non-wash transaction volume on BOT Chain, maximizing the value of the 35% Gas Rebate mechanism.

---

## 5. Development Roadmap

- **Phase 1: Architecture & EVM Migration (Completed)**
  - Solidity contract architecture designed, audited locally, and compiled.
  - Full frontend migration to BOT Chain RPC and block explorer integration.
- **Phase 2: Testnet Deployment & Verification (Completed - Live)**
  - Deployed `VesoredPortfolio.sol` on Bohr Testnet (`0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`).
  - Integrated live JSON-RPC balance fetching and multi-wallet support.
- **Phase 3: Ecosystem Integration & Mainnet Launch (Q4 2026 - Current)**
  - Integration with BOT Chain DEX for automated stop-loss and limit order execution.
  - Mainnet deployment on BOT Chain (Chain ID `677`).
  - Launch of community incentive and points reward campaign.
- **Phase 4: Institutional AI Analytics & Mobile App (Q1 2027)**
  - DePIN data feed integrations for node validator performance metrics.
  - Mobile native application with BO Wallet SDK integration.

---

## 6. Official Verification Links

- **GitHub Repository**: [https://github.com/githoboman/vesored](https://github.com/githoboman/vesored)
- **Deployed Testnet Contract**: [https://scan.bohr.life/address/0xe9cEf47279c40d44fc11937c949FAC7C7794e70C](https://scan.bohr.life/address/0xe9cEf47279c40d44fc11937c949FAC7C7794e70C)
- **Deployment Transaction**: [https://scan.bohr.life/tx/0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68](https://scan.bohr.life/tx/0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68)
- **Deployer / Primary Wallet**: `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **Contact Email**: smithmar681@gmail.com
