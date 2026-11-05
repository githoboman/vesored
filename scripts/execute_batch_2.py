#!/usr/bin/env python3
"""
Execute 3 additional live on-chain transactions on BOT Chain Bohr Testnet
against the deployed VesoredPortfolio contract (0xe9cEf47279c40d44fc11937c949FAC7C7794e70C).
"""
import os
import json
import time
from web3 import Web3

def load_secrets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    secrets_path = os.path.join(base_dir, "secrets.txt")
    secrets = {}
    with open(secrets_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                secrets[key.strip()] = val.strip().strip('"').strip("'")
    return secrets, base_dir

def run():
    secrets, base_dir = load_secrets()
    private_key = secrets.get("DEPLOYER_PRIVATE_KEY")
    contract_address = secrets.get("TESTNET_PORTFOLIO_CONTRACT_ADDRESS", "0xe9cEf47279c40d44fc11937c949FAC7C7794e70C")
    rpc_url = secrets.get("BOT_CHAIN_TESTNET_RPC", "https://rpc.bohr.life")
    chain_id = int(secrets.get("BOT_CHAIN_TESTNET_CHAIN_ID", 968))

    w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 25}))
    account = w3.eth.account.from_key(private_key)

    with open(os.path.join(base_dir, "artifacts", "VesoredPortfolio.json"), "r", encoding="utf-8") as f:
        artifact = json.load(f)
    contract = w3.eth.contract(address=contract_address, abi=artifact["abi"])

    print(f"Deployer: {account.address}")
    print(f"Contract: {contract_address}")
    print(f"Balance:  {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} tBOT")

    # Load existing records
    records_file = os.path.join(base_dir, "docs", "ONCHAIN_TRANSACTIONS.json")
    with open(records_file, "r", encoding="utf-8") as f:
        tx_records = json.load(f)

    new_actions = [
        {
            "name": "addTransaction (Hedging Buy WBTC)",
            "call": contract.functions.addTransaction(
                "WBTC",
                50000000,                       # 0.5 WBTC (1e8)
                0                               # 0 = Buy
            ),
            "details": "Risk Hedging: Buy 0.5 WBTC to decrease macro portfolio drawdown risk"
        },
        {
            "name": "updatePrices (Dynamic Oracle Refresh)",
            "call": contract.functions.updatePrices(
                67100000000,                    # $67,100 BTC
                3420000000,                     # $3,420 ETH
                920000                          # $0.92 BOT
            ),
            "details": "Oracle update: BTC=$67,100, ETH=$3,420, BOT=$0.92"
        },
        {
            "name": "createOrUpdatePortfolio (Final Risk-Hedged State)",
            "call": contract.functions.createOrUpdatePortfolio(
                174000000,                      # 1.74 BTC
                6150000000000000000,            # 6.15 ETH
                18500000000,                    # $18,500 USD
                11500000000000000000000         # 11,500 BOT
            ),
            "details": "Portfolio rebalancing state: 1.74 BTC, 6.15 ETH, $18,500 USD, 11,500 BOT"
        }
    ]

    for i, act in enumerate(new_actions, start=len(tx_records) + 1):
        print(f"\n[{i}/10] Sending {act['name']}...")
        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price

        tx = act["call"].build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gasPrice": gas_price,
            "chainId": chain_id,
        })

        try:
            est_gas = w3.eth.estimate_gas(tx)
            tx["gas"] = int(est_gas * 1.3)
        except:
            tx["gas"] = 350000

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        raw_bytes = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction")
        tx_hash = w3.eth.send_raw_transaction(raw_bytes)
        tx_hash_hex = tx_hash.hex()
        if not tx_hash_hex.startswith("0x"):
            tx_hash_hex = "0x" + tx_hash_hex

        print(f"Broadcasted: {tx_hash_hex}")
        print("Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        gas_cost_wei = receipt.gasUsed * gas_price
        gas_cost_tbot = w3.from_wei(gas_cost_wei, "ether")

        print(f"Confirmed in Block: {receipt.blockNumber} (Gas: {receipt.gasUsed})")

        record = {
            "action": act["name"],
            "tx_hash": tx_hash_hex,
            "block": receipt.blockNumber,
            "from": account.address,
            "to": contract_address,
            "method": act["name"].split(" ")[0],
            "details": act["details"],
            "gas_used": receipt.gasUsed,
            "gas_cost_tbot": str(gas_cost_tbot),
            "status": "Success (1)" if receipt.status == 1 else "Failed (0)"
        }
        tx_records.append(record)
        time.sleep(1)

    # Save to JSON
    with open(records_file, "w", encoding="utf-8") as f:
        json.dump(tx_records, f, indent=2)

    # Update Markdown Document
    md_output = os.path.join(base_dir, "docs", "ONCHAIN_INTERACTION_RECORDS.md")
    with open(md_output, "w", encoding="utf-8") as f:
        f.write("# BOT Chain Testnet — On-Chain Interaction & Transaction Records\n")
        f.write(f"**Project:** Vesored (AI Behavioral Portfolio & Risk Engine)\n")
        f.write(f"**Network:** BOT Chain Testnet (Bohr, Chain ID: 968)\n")
        f.write(f"**Contract Address:** `{contract_address}` ([View on Bohr Explorer](https://scan.bohr.life/address/{contract_address}))\n")
        f.write(f"**Deployer / Submitting Wallet:** `{account.address}` ([View on Bohr Explorer](https://scan.bohr.life/address/{account.address}))\n")
        f.write(f"**Generated:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}\n\n")
        f.write("---\n\n")
        f.write("## 1. Verified Transaction Ledger\n\n")
        f.write("| # | Action / Method | Transaction Hash | Block | Status | Details |\n")
        f.write("| :-: | :--- | :--- | :-: | :-: | :--- |\n")
        for idx, t in enumerate(tx_records, start=1):
            f.write(f"| {idx} | **{t['method']}** | [`{t['tx_hash'][:10]}...{t['tx_hash'][-8:]}`](https://scan.bohr.life/tx/{t['tx_hash']}) | `{t['block']}` | {t['status']} | {t['details']} |\n")

        f.write("\n---\n\n")
        f.write("## 2. Transaction Details Breakdown\n\n")
        for idx, t in enumerate(tx_records, start=1):
            f.write(f"### Transaction #{idx}: {t['action']}\n")
            f.write(f"- **Transaction Hash:** [`{t['tx_hash']}`](https://scan.bohr.life/tx/{t['tx_hash']})\n")
            f.write(f"- **Block Height:** `{t['block']}`\n")
            f.write(f"- **From Address:** `{t['from']}`\n")
            f.write(f"- **To Address:** `{t['to']}`\n")
            f.write(f"- **Method Called:** `{t['method']}`\n")
            if "gas_used" in t:
                f.write(f"- **Gas Used:** `{t['gas_used']:,}` units (~{t['gas_cost_tbot']} tBOT)\n")
            f.write(f"- **Execution Status:** `{t['status']}`\n")
            f.write(f"- **On-Chain Impact:** {t['details']}\n\n")

        f.write("---\n\n")
        f.write("## 3. On-Chain State Verification Summary\n")
        f.write(f"- **Total Transactions Executed:** {len(tx_records)}\n")
        f.write(f"- **Risk Score Evaluator:** Calling `getRiskScore('{account.address}')` verifies dynamic algorithmic scoring factoring new portfolio distribution.\n")
        f.write(f"- **Portfolio Ledger:** Calling `getPortfolioOf('{account.address}')` confirms real-time balance state stored in smart contract memory.\n")
        f.write(f"- **Transaction History:** Calling `getTransactionHistory()` verifies all immutable trade/transfer entries ledgered on BOT Chain.\n")

    print("Successfully completed batch of 3 transactions and updated documentation!")

if __name__ == "__main__":
    run()
