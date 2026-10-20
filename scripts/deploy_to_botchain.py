#!/usr/bin/env python3
"""
Deploy VesoredPortfolio.sol to BOT Chain (Bohr Testnet or Mainnet)
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

def deploy():
    secrets, base_dir = load_secrets()
    private_key = secrets.get("DEPLOYER_PRIVATE_KEY")
    rpc_url = secrets.get("BOT_CHAIN_TESTNET_RPC", "https://rpc.bohr.life")
    chain_id = int(secrets.get("BOT_CHAIN_TESTNET_CHAIN_ID", 968))

    if not private_key or "ENTER_YOUR" in private_key:
        print("[ERROR] DEPLOYER_PRIVATE_KEY is not set in secrets.txt")
        return

    print("=" * 60)
    print("DEPLOYING VESORED PORTFOLIO TO BOT CHAIN")
    print("=" * 60)
    print(f"Network RPC: {rpc_url}")
    print(f"Chain ID:    {chain_id}")

    w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 20}))
    if not w3.is_connected():
        print(f"[ERROR] Failed to connect to RPC: {rpc_url}")
        return

    account = w3.eth.account.from_key(private_key)
    print(f"Deployer:    {account.address}")

    balance_wei = w3.eth.get_balance(account.address)
    balance_eth = w3.from_wei(balance_wei, "ether")
    print(f"Balance:     {balance_eth} tBOT")

    if balance_wei == 0:
        print("[ERROR] Deployer wallet has 0 balance! Please fund it via https://faucet.botchain.ai/basic")
        return

    # Load artifact
    artifact_path = os.path.join(base_dir, "artifacts", "VesoredPortfolio.json")
    if not os.path.exists(artifact_path):
        print(f"[ERROR] Artifact not found at {artifact_path}. Please run compile_contract.cjs first.")
        return

    with open(artifact_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    bytecode = artifact["bytecode"]
    abi = artifact["abi"]

    nonce = w3.eth.get_transaction_count(account.address)
    gas_price = w3.eth.gas_price

    print(f"Nonce:       {nonce}")
    print(f"Gas Price:   {w3.from_wei(gas_price, 'gwei')} Gwei")
    print("\nPreparing deployment transaction...")

    tx = {
        "from": account.address,
        "nonce": nonce,
        "data": bytecode,
        "gasPrice": gas_price,
        "chainId": chain_id,
    }

    try:
        estimated_gas = w3.eth.estimate_gas(tx)
        tx["gas"] = int(estimated_gas * 1.3)
        print(f"Estimated Gas: {estimated_gas} (Using: {tx['gas']})")
    except Exception as e:
        print(f"[WARN] Gas estimation failed: {e}. Falling back to 3,500,000 gas limit.")
        tx["gas"] = 3500000

    print("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)

    print("Broadcasting transaction to BOT Chain...")
    raw_tx_bytes = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction")
    tx_hash = w3.eth.send_raw_transaction(raw_tx_bytes)
    tx_hash_hex = tx_hash.hex()
    if not tx_hash_hex.startswith("0x"):
        tx_hash_hex = "0x" + tx_hash_hex

    print(f"\n>> Transaction Broadcast! Hash: {tx_hash_hex}")
    print(f">> View on Explorer: https://scan.bohr.life/tx/{tx_hash_hex}")
    print("Waiting for block confirmation (~0.75s block time)...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    contract_address = receipt.contractAddress

    print("=" * 60)
    print("DEPLOYMENT CONFIRMED ON BOT CHAIN!")
    print("=" * 60)
    print(f"Contract Address: {contract_address}")
    print(f"Block Number:     {receipt.blockNumber}")
    print(f"Gas Used:         {receipt.gasUsed}")
    print(f"Status:           {'SUCCESS (1)' if receipt.status == 1 else 'FAILED (0)'}")
    print(f"Explorer URL:     https://scan.bohr.life/address/{contract_address}")
    print("=" * 60)

    # Update secrets.txt and secretes.txt
    for fname in ["secrets.txt", "secretes.txt"]:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            content = re.sub(
                r'TESTNET_PORTFOLIO_CONTRACT_ADDRESS=.*',
                f'TESTNET_PORTFOLIO_CONTRACT_ADDRESS="{contract_address}"',
                content
            )
            content = re.sub(
                r'VITE_PORTFOLIO_CONTRACT_ADDRESS=.*',
                f'VITE_PORTFOLIO_CONTRACT_ADDRESS="{contract_address}"',
                content
            )
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {fname} with deployed contract address.")

    # Update frontend .env
    env_path = os.path.join(base_dir, "src", "frontend", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            env_content = f.read()
        env_content = re.sub(
            r'VITE_PORTFOLIO_CONTRACT_ADDRESS=.*',
            f'VITE_PORTFOLIO_CONTRACT_ADDRESS="{contract_address}"',
            env_content
        )
        with open(env_path, "w", encoding="utf-8") as f:
            env_content = f.write(env_content)
        print("Updated src/frontend/.env with deployed contract address.")

    # Save deployment metadata JSON
    deployments_dir = os.path.join(base_dir, "src", "backend", "deployments")
    os.makedirs(deployments_dir, exist_ok=True)
    deployment_record = {
        "network": "botTestnet",
        "chainId": chain_id,
        "contractAddress": contract_address,
        "transactionHash": tx_hash_hex,
        "blockNumber": receipt.blockNumber,
        "deployer": account.address,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    record_path = os.path.join(deployments_dir, "botTestnet.json")
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(deployment_record, f, indent=2)
    print(f"Deployment record saved to {record_path}")

    return contract_address, tx_hash_hex

if __name__ == "__main__":
    deploy()
