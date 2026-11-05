#!/usr/bin/env python3
import os
from web3 import Web3

def main():
    secrets = {}
    with open("secrets.txt", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                secrets[k.strip()] = v.strip().strip('"').strip("'")

    pk = secrets["DEPLOYER_PRIVATE_KEY"]
    w3 = Web3(Web3.HTTPProvider("https://rpc.botchain.ai", request_kwargs={"timeout": 20}))
    acct = w3.eth.account.from_key(pk)
    to_addr = "0x85D7514417Fbccda75D3B08421F86721Dd0d4d17"

    bal = w3.eth.get_balance(acct.address)
    gas_price = w3.eth.gas_price
    transfer_gas = 21000
    gas_cost = transfer_gas * gas_price

    print("Deployer Address:    ", acct.address)
    print("Recipient Address:   ", to_addr)
    print("Current Balance:     ", bal, "wei (", w3.from_wei(bal, "ether"), "BOT )")
    print("Network Gas Price:   ", gas_price, "wei (", w3.from_wei(gas_price, "gwei"), "Gwei )")
    print("Gas Fee Needed:      ", gas_cost, "wei (", w3.from_wei(gas_cost, "ether"), "BOT )")

    if bal < gas_cost:
        shortfall = gas_cost - bal
        print("\n[RESULT] Cannot send transaction.")
        print(f"The wallet has {bal} wei, but the minimum network gas fee is {gas_cost} wei.")
        print(f"Shortfall to even broadcast a transfer: {shortfall} wei ({w3.from_wei(shortfall, 'ether')} BOT).")
        return

    send_amount = bal - gas_cost
    print(f"Sending {send_amount} wei ({w3.from_wei(send_amount, 'ether')} BOT)...")

    tx = {
        "from": acct.address,
        "to": to_addr,
        "value": send_amount,
        "gas": transfer_gas,
        "gasPrice": gas_price,
        "nonce": w3.eth.get_transaction_count(acct.address),
        "chainId": 677
    }
    signed = w3.eth.account.sign_transaction(tx, pk)
    raw = getattr(signed, "raw_transaction", None) or getattr(signed, "rawTransaction")
    tx_hash = w3.eth.send_raw_transaction(raw)
    print("Broadcasted Tx Hash:", tx_hash.hex())

if __name__ == "__main__":
    main()

