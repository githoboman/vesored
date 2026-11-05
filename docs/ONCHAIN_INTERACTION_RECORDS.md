# BOT Chain Testnet — On-Chain Interaction & Transaction Records
**Project:** Vesored (AI Behavioral Portfolio & Risk Engine)
**Network:** BOT Chain Testnet (Bohr, Chain ID: 968)
**Contract Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C` ([View on Bohr Explorer](https://scan.bohr.life/address/0xe9cEf47279c40d44fc11937c949FAC7C7794e70C))
**Deployer / Submitting Wallet:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E` ([View on Bohr Explorer](https://scan.bohr.life/address/0x8b2119E6D52DCda17ce233d16Ef2313E6750028E))
**Generated:** 2026-10-20 11:28:19 UTC

---

## 1. Verified Transaction Ledger

| # | Action / Method | Transaction Hash | Block | Status | Details |
| :-: | :--- | :--- | :-: | :-: | :--- |
| 1 | **deploy()** | [`0x1884307c...af738c68`](https://scan.bohr.life/tx/0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68) | `27099023` | Success (1) | Deployed VesoredPortfolio core contract to Bohr Testnet |
| 2 | **createOrUpdatePortfolio** | [`0x95f8ecec...83978bd5`](https://scan.bohr.life/tx/0x95f8ecec659ac756a5c4c0c9c6f903494c2e36f57b0efbcc123cd40683978bd5) | `27514913` | Success (1) | Initialize on-chain portfolio: 1.24 BTC, 8.65 ETH, $15,000 USD, 10,000 BOT |
| 3 | **addTransaction** | [`0x82ee86b2...328c5142`](https://scan.bohr.life/tx/0x82ee86b2ebce4ebbc9d9e4748632351791fae883dc0504b80d8cdec4328c5142) | `27514920` | Success (1) | Execute trade: Buy 1,500 BOT at market price |
| 4 | **addTransaction** | [`0xfbaf279d...5516cf41`](https://scan.bohr.life/tx/0xfbaf279d9680e87801baeaed93e10767ad258c21415c4290c332e44a5516cf41) | `27514927` | Success (1) | Execute trade: Sell 2.5 ETH for risk exposure rebalancing |
| 5 | **addTransaction** | [`0x736ff5cb...6e0034a0`](https://scan.bohr.life/tx/0x736ff5cbfa879954264b536acab1bcc9e513e4dc3010854a5f94333b6e0034a0) | `27514936` | Success (1) | Deposit: 500 tBOT into Vesored native gas vault |
| 6 | **updatePrices** | [`0xb1db50b5...ea8570b2`](https://scan.bohr.life/tx/0xb1db50b513baf71d73962bca59c7c59e9b8771fb79a51c3c642014d1ea8570b2) | `27514944` | Success (1) | Oracle update: BTC=$66,250, ETH=$3,350, BOT=$0.85 |
| 7 | **createOrUpdatePortfolio** | [`0xc96b438f...6bde242f`](https://scan.bohr.life/tx/0xc96b438fc6ac46bb4e811599c3960c5c246bb5fda0ec6ea1ebcba2136bde242f) | `27514951` | Success (1) | Update portfolio state post-rebalance: 1.24 BTC, 6.15 ETH, $23,375 USD, 11,500 BOT |

---

## 2. Transaction Details Breakdown

### Transaction #1: Contract Deployment (VesoredPortfolio.sol)
- **Transaction Hash:** [`0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68`](https://scan.bohr.life/tx/0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68)
- **Block Height:** `27099023`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `Contract Creation (0xe9cEf47279c40d44fc11937c949FAC7C7794e70C)`
- **Method Called:** `deploy()`
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Deployed VesoredPortfolio core contract to Bohr Testnet

### Transaction #2: createOrUpdatePortfolio (Initial Allocation)
- **Transaction Hash:** [`0x95f8ecec659ac756a5c4c0c9c6f903494c2e36f57b0efbcc123cd40683978bd5`](https://scan.bohr.life/tx/0x95f8ecec659ac756a5c4c0c9c6f903494c2e36f57b0efbcc123cd40683978bd5)
- **Block Height:** `27514913`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `createOrUpdatePortfolio`
- **Gas Used:** `157,658` units (~0.00315316 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Initialize on-chain portfolio: 1.24 BTC, 8.65 ETH, $15,000 USD, 10,000 BOT

### Transaction #3: addTransaction (Buy BOT Token)
- **Transaction Hash:** [`0x82ee86b2ebce4ebbc9d9e4748632351791fae883dc0504b80d8cdec4328c5142`](https://scan.bohr.life/tx/0x82ee86b2ebce4ebbc9d9e4748632351791fae883dc0504b80d8cdec4328c5142)
- **Block Height:** `27514920`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `addTransaction`
- **Gas Used:** `116,917` units (~0.00233834 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Execute trade: Buy 1,500 BOT at market price

### Transaction #4: addTransaction (Sell ETH Rebalance)
- **Transaction Hash:** [`0xfbaf279d9680e87801baeaed93e10767ad258c21415c4290c332e44a5516cf41`](https://scan.bohr.life/tx/0xfbaf279d9680e87801baeaed93e10767ad258c21415c4290c332e44a5516cf41)
- **Block Height:** `27514927`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `addTransaction`
- **Gas Used:** `119,717` units (~0.00239434 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Execute trade: Sell 2.5 ETH for risk exposure rebalancing

### Transaction #5: addTransaction (Deposit tBOT Gas Vault)
- **Transaction Hash:** [`0x736ff5cbfa879954264b536acab1bcc9e513e4dc3010854a5f94333b6e0034a0`](https://scan.bohr.life/tx/0x736ff5cbfa879954264b536acab1bcc9e513e4dc3010854a5f94333b6e0034a0)
- **Block Height:** `27514936`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `addTransaction`
- **Gas Used:** `119,741` units (~0.00239482 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Deposit: 500 tBOT into Vesored native gas vault

### Transaction #6: updatePrices (Oracle Price Update)
- **Transaction Hash:** [`0xb1db50b513baf71d73962bca59c7c59e9b8771fb79a51c3c642014d1ea8570b2`](https://scan.bohr.life/tx/0xb1db50b513baf71d73962bca59c7c59e9b8771fb79a51c3c642014d1ea8570b2)
- **Block Height:** `27514944`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `updatePrices`
- **Gas Used:** `40,710` units (~0.0008142 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Oracle update: BTC=$66,250, ETH=$3,350, BOT=$0.85

### Transaction #7: createOrUpdatePortfolio (Rebalanced Portfolio State)
- **Transaction Hash:** [`0xc96b438fc6ac46bb4e811599c3960c5c246bb5fda0ec6ea1ebcba2136bde242f`](https://scan.bohr.life/tx/0xc96b438fc6ac46bb4e811599c3960c5c246bb5fda0ec6ea1ebcba2136bde242f)
- **Block Height:** `27514951`
- **From Address:** `0x8b2119E6D52DCda17ce233d16Ef2313E6750028E`
- **To Address:** `0xe9cEf47279c40d44fc11937c949FAC7C7794e70C`
- **Method Called:** `createOrUpdatePortfolio`
- **Gas Used:** `49,470` units (~0.0009894 tBOT)
- **Execution Status:** `Success (1)`
- **On-Chain Impact:** Update portfolio state post-rebalance: 1.24 BTC, 6.15 ETH, $23,375 USD, 11,500 BOT

---

## 3. On-Chain State Verification Summary
- **Risk Score Evaluator:** Calling `getRiskScore('0x8b2119E6D52DCda17ce233d16Ef2313E6750028E')` verifies dynamic algorithmic scoring factoring new portfolio distribution.
- **Portfolio Ledger:** Calling `getPortfolioOf('0x8b2119E6D52DCda17ce233d16Ef2313E6750028E')` confirms real-time balance state stored in smart contract memory.
- **Transaction History:** Calling `getTransactionHistory()` verifies the 4 immutable trade/transfer entries ledgered on BOT Chain.
