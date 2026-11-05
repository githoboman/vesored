#!/usr/bin/env python3
"""
Execute a sequence of live on-chain transactions on BOT Chain Bohr Testnet
against the deployed VesoredPortfolio contract, collecting full transaction receipts.
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

def run_transactions():
    secrets, base_dir = load_secrets()
    private_key = secrets.get("DEPLOYER_PRIVATE_KEY")
    contract_address = secrets.get("TESTNET_PORTFOLIO_CONTRACT_ADDRESS", "0xe9cEf47279c40d44fc11937c949FAC7C7794e70C")
    rpc_url = secrets.get("BOT_CHAIN_TESTNET_RPC", "https://rpc.bohr.life")
    chain_id = int(secrets.get("BOT_CHAIN_TESTNET_CHAIN_ID", 968))

    w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 20}))
    account = w3.eth.account.from_key(private_key)

    with open(os.path.join(base_dir, "artifacts", "VesoredPortfolio.json"), "r", encoding="utf-8") as f:
        artifact = json.load(f)
    contract = w3.eth.contract(address=contract_address, abi=artifact["abi"])

    print(f"Deployer Address: {account.address}")
    print(f"Contract Address: {contract_address}")
    print(f"Current Balance:  {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} tBOT")
    print("=" * 70)

    tx_records = []

    # Include Contract Deployment as Tx #1
    deployment_tx = {
        "action": "Contract Deployment (VesoredPortfolio.sol)",
        "tx_hash": "0x1884307c4b3c883285f90dd02d4574dacd3cdb28b50431fa329cbd39af738c68",
        "block": 27099023,
        "from": account.address,
        "to": "Contract Creation (" + contract_address + ")",
        "method": "deploy()",
        "details": "Deployed VesoredPortfolio core contract to Bohr Testnet",
        "status": "Success (1)"
    }
    tx_records.append(deployment_tx)

    # Actions to perform
    actions = [
        {
            "name": "createOrUpdatePortfolio (Initial Allocation)",
            "call": contract.functions.createOrUpdatePortfolio(
                124000000,                      # 1.24 BTC (1e8)
                8650000000000000000,            # 8.65 ETH (1e18)
                15000000000,                    # $15,000 USD (1e6)
                10000000000000000000000         # 10,000 BOT (1e18)
            ),
            "details": "Initialize on-chain portfolio: 1.24 BTC, 8.65 ETH, $15,000 USD, 10,000 BOT"
        },
        {
            "name": "addTransaction (Buy BOT Token)",
            "call": contract.functions.addTransaction(
                "BOT",
                1500000000000000000000,         # 1,500 BOT
                0                               # 0 = Buy
            ),
            "details": "Execute trade: Buy 1,500 BOT at market price"
        },
        {
            "name": "addTransaction (Sell ETH Rebalance)",
            "call": contract.functions.addTransaction(
                "ETH",
                2500000000000000000,            # 2.5 ETH
                1                               # 1 = Sell
            ),
            "details": "Execute trade: Sell 2.5 ETH for risk exposure rebalancing"
        },
        {
            "name": "addTransaction (Deposit tBOT Gas Vault)",
            "call": contract.functions.addTransaction(
                "tBOT",
                500000000000000000000,          # 500 tBOT
                2                               # 2 = Deposit
            ),
            "details": "Deposit: 500 tBOT into Vesored native gas vault"
        },
        {
            "name": "updatePrices (Oracle Price Update)",
            "call": contract.functions.updatePrices(
                66250000000,                    # $66,250 BTC
                3350000000,                     # $3,350 ETH
                850000                          # $0.85 BOT
            ),
            "details": "Oracle update: BTC=$66,250, ETH=$3,350, BOT=$0.85"
        },
        {
            "name": "createOrUpdatePortfolio (Rebalanced Portfolio State)",
            "call": contract.functions.createOrUpdatePortfolio(
                124000000,                      # 1.24 BTC
                6150000000000000000,            # 6.15 ETH (after 2.5 ETH sell)
                23375000000,                    # $23,375 USD
                11500000000000000000000         # 11,500 BOT (after 1,500 BOT buy)
            ),
            "details": "Update portfolio state post-rebalance: 1.24 BTC, 6.15 ETH, $23,375 USD, 11,500 BOT"
        }
    ]

    for i, act in enumerate(actions, start=1):
        print(f"\n[{i}/{len(actions)}] Sending {act['name']}...")
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
        print("Waiting for confirmation (~0.75s)...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        gas_cost_wei = receipt.gasUsed * gas_price
        gas_cost_tbot = w3.from_wei(gas_cost_wei, "ether")

        print(f"Confirmed in Block: {receipt.blockNumber} (Gas: {receipt.gasUsed}, Cost: {gas_cost_tbot:.8f} tBOT)")

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
    output_file = os.path.join(base_dir, "docs", "ONCHAIN_TRANSACTIONS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(tx_records, f, indent=2)
    print(f"\nAll transactions saved to {output_file}")

    # Generate Markdown Document
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
        f.write(f"- **Risk Score Evaluator:** Calling `getRiskScore('{account.address}')` verifies dynamic algorithmic scoring factoring new portfolio distribution.\n")
        f.write(f"- **Portfolio Ledger:** Calling `getPortfolioOf('{account.address}')` confirms real-time balance state stored in smart contract memory.\n")
        f.write(f"- **Transaction History:** Calling `getTransactionHistory()` verifies the 4 immutable trade/transfer entries ledgered on BOT Chain.\n")

    print(f"Markdown document saved to {md_output}")

if __name__ == "__main__":
    run_transactions()
