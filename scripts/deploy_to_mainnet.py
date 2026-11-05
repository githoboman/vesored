#!/usr/bin/env python3
"""
Deploy VesoredPortfolio.sol to BOT Chain Mainnet (Chain ID: 677)
"""
import os
import re
import json
import time
from web3 import Web3

def load_secrets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    secrets_path = os.path.join(base_dir, "secrets.txt")
    secrets = {}
    if os.path.exists(secrets_path):
        with open(secrets_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    secrets[key.strip()] = val.strip().strip('"').strip("'")
    return secrets, base_dir

def deploy_mainnet():
    secrets, base_dir = load_secrets()
    private_key = secrets.get("DEPLOYER_PRIVATE_KEY")
    rpc_url = secrets.get("BOT_CHAIN_MAINNET_RPC", "https://rpc.botchain.ai")
    chain_id = int(secrets.get("BOT_CHAIN_MAINNET_CHAIN_ID", 677))

    print("=" * 65)
    print("DEPLOYING VESORED PORTFOLIO TO BOT CHAIN MAINNET")
    print("=" * 65)
    print(f"Network RPC: {rpc_url}")
    print(f"Chain ID:    {chain_id}")

    w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 25}))
    if not w3.is_connected():
        print(f"[ERROR] Failed to connect to RPC: {rpc_url}")
        return False

    account = w3.eth.account.from_key(private_key)
    print(f"Deployer:    {account.address}")

    balance_wei = w3.eth.get_balance(account.address)
    balance_eth = w3.from_wei(balance_wei, "ether")
    print(f"Balance:     {balance_eth} BOT ({balance_wei} wei)")

    if balance_wei == 0:
        print("[ERROR] Deployer wallet balance is 0 BOT!")
        return False

    # Load artifact
    artifact_path = os.path.join(base_dir, "artifacts", "VesoredPortfolio.json")
    with open(artifact_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    bytecode = artifact["bytecode"]
    abi = artifact["abi"]

    nonce = w3.eth.get_transaction_count(account.address)
    gas_price = w3.eth.gas_price
    print(f"Nonce:               {nonce}")
    print(f"Network Gas Price:   {w3.from_wei(gas_price, 'gwei')} Gwei ({gas_price} wei)")

    # Gas estimation
    dummy_tx = {
        "from": account.address,
        "nonce": nonce,
        "data": bytecode,
        "chainId": chain_id
    }
    try:
        estimated_gas = w3.eth.estimate_gas(dummy_tx)
        print(f"Estimated Gas Units: {estimated_gas}")
    except Exception as e:
        print(f"[WARN] Gas estimation call failed: {e}")
        estimated_gas = 878136

    # Max gas limit supported by current balance at network gas_price
    max_gas_by_balance = balance_wei // gas_price
    print(f"Max Gas by Balance:  {max_gas_by_balance} units")

    if max_gas_by_balance < estimated_gas:
        print(f"[ERROR] Balance allows max {max_gas_by_balance} gas, but estimation is {estimated_gas}.")
        return False

    # Set gas limit to max_gas_by_balance (e.g. 880,000)
    gas_limit = max_gas_by_balance
    total_upfront_cost = gas_limit * gas_price
    print(f"Gas Limit Set To:    {gas_limit} units")
    print(f"Upfront Cost:        {w3.from_wei(total_upfront_cost, 'ether')} BOT")

    tx = {
        "from": account.address,
        "nonce": nonce,
        "data": bytecode,
        "gas": gas_limit,
        "gasPrice": gas_price,
        "chainId": chain_id,
    }

    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    raw_tx_bytes = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction")

    print("\nBroadcasting deployment transaction to BOT Chain Mainnet...")
    try:
        tx_hash = w3.eth.send_raw_transaction(raw_tx_bytes)
    except Exception as e:
        print(f"\n[BROADCAST ERROR] {e}")
        return False

    tx_hash_hex = tx_hash.hex()
    if not tx_hash_hex.startswith("0x"):
        tx_hash_hex = "0x" + tx_hash_hex

    print(f"\n>> Transaction Broadcast Succeeded! Hash: {tx_hash_hex}")
    print(f">> View on Explorer: https://scan.botchain.ai/tx/{tx_hash_hex}")
    print("Waiting for block confirmation...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    contract_address = receipt.contractAddress

    print("=" * 65)
    print("DEPLOYMENT CONFIRMED ON BOT CHAIN MAINNET!")
    print("=" * 65)
    print(f"Contract Address: {contract_address}")
    print(f"Block Number:     {receipt.blockNumber}")
    print(f"Gas Used:         {receipt.gasUsed}")
    actual_cost = receipt.gasUsed * gas_price
    print(f"Actual Gas Cost:  {w3.from_wei(actual_cost, 'ether')} BOT")
    print(f"Status:           {'SUCCESS (1)' if receipt.status == 1 else 'FAILED (0)'}")
    print(f"Explorer URL:     https://scan.botchain.ai/address/{contract_address}")
    print("=" * 65)

    # Save to deployments
    deployments_dir = os.path.join(base_dir, "src", "backend", "deployments")
    os.makedirs(deployments_dir, exist_ok=True)
    deployment_record = {
        "network": "botMainnet",
        "chainId": chain_id,
        "contractAddress": contract_address,
        "transactionHash": tx_hash_hex,
        "blockNumber": receipt.blockNumber,
        "deployer": account.address,
        "gasUsed": receipt.gasUsed,
        "gasCostBOT": str(w3.from_wei(actual_cost, "ether")),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    record_path = os.path.join(deployments_dir, "botMainnet.json")
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(deployment_record, f, indent=2)
    print(f"Deployment record saved to {record_path}")

    # Update secrets.txt and secretes.txt
    for fname in ["secrets.txt", "secretes.txt"]:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            if "MAINNET_PORTFOLIO_CONTRACT_ADDRESS=" in content:
                content = re.sub(
                    r'MAINNET_PORTFOLIO_CONTRACT_ADDRESS=.*',
                    f'MAINNET_PORTFOLIO_CONTRACT_ADDRESS="{contract_address}"',
                    content
                )
            else:
                content += f'\nMAINNET_PORTFOLIO_CONTRACT_ADDRESS="{contract_address}"\n'
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {fname} with MAINNET_PORTFOLIO_CONTRACT_ADDRESS.")

    return True

if __name__ == "__main__":
    deploy_mainnet()
