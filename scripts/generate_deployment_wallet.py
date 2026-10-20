#!/usr/bin/env python3
"""
Generate a fresh EVM deployment wallet for BOT Chain (Bohr Testnet / Mainnet)
and securely update secrets.txt and secretes.txt.
"""
import os
import re
from eth_account import Account

# Enable HD wallet (mnemonic) feature in eth_account
Account.enable_unaudited_hdwallet_features()

def generate_wallet():
    # Generate account with 12-word mnemonic
    acct, mnemonic = Account.create_with_mnemonic()
    private_key = acct.key.hex()
    if not private_key.startswith("0x"):
        private_key = "0x" + private_key
    address = acct.address

    print("=" * 60)
    print("NEW BOT CHAIN DEPLOYMENT WALLET GENERATED")
    print("=" * 60)
    print(f"Public Address: {address}")
    print(f"Private Key:    {private_key}")
    print(f"Mnemonic:       {mnemonic}")
    print("=" * 60)

    # Base workspace directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    secrets_files = [
        os.path.join(base_dir, "secrets.txt"),
        os.path.join(base_dir, "secretes.txt")
    ]

    for secrets_path in secrets_files:
        if not os.path.exists(secrets_path):
            continue

        with open(secrets_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace DEPLOYER_PRIVATE_KEY
        content = re.sub(
            r'DEPLOYER_PRIVATE_KEY=.*',
            f'DEPLOYER_PRIVATE_KEY={private_key}',
            content
        )
        # Replace DEPLOYER_ADDRESS
        content = re.sub(
            r'DEPLOYER_ADDRESS=.*',
            f'DEPLOYER_ADDRESS={address}',
            content
        )
        # Replace MNEMONIC
        content = re.sub(
            r'MNEMONIC=.*',
            f'MNEMONIC="{mnemonic}"',
            content
        )

        with open(secrets_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully updated credentials in {os.path.basename(secrets_path)}")

    print("\nNext step: Claim test tokens from the Bohr Testnet faucet:")
    print(f"Faucet URL: https://faucet.botchain.ai/basic")
    print(f"Explorer URL: https://scan.bohr.life/address/{address}")

if __name__ == "__main__":
    generate_wallet()
