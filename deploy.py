from solcx import compile_standard, install_solc
from web3 import Web3
import json
import os

# Install specific Solidity compiler version
print("Installing Solidity compiler...")
install_solc('0.8.0')

# Connect to Ganache
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

# Check connection
if not web3.is_connected():
    print("Failed to connect to Ganache. Make sure Ganache is running on port 7545.")
    exit(1)

print(f"Connected to Ganache: {web3.is_connected()}")
print(f"Chain ID: {web3.eth.chain_id}")

# Read the contract
with open('contracts/RealEstateToken.sol', 'r') as file:
    contract_source_code = file.read()

# Compile the contract
print("\nCompiling contract...")
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"RealEstateToken.sol": {"content": contract_source_code}},
        "settings": {
            "outputSelection": {
                "*": {
                    "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                }
            }
        },
    },
    solc_version="0.8.0",
)

# Get bytecode and ABI
bytecode = compiled_sol['contracts']['RealEstateToken.sol']['RealEstateToken']['evm']['bytecode']['object']
abi = compiled_sol['contracts']['RealEstateToken.sol']['RealEstateToken']['abi']

print("Contract compiled successfully!")

# Get the first account from Ganache
account = web3.eth.accounts[0]
print(f"\nDeploying from account: {account}")
print(f"Account balance: {web3.from_wei(web3.eth.get_balance(account), 'ether')} ETH")

# Create contract instance
RealEstateToken = web3.eth.contract(abi=abi, bytecode=bytecode)

# Deploy contract
print("\nDeploying contract...")
tx_hash = RealEstateToken.constructor().transact({'from': account})
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

contract_address = tx_receipt.contractAddress
print(f"Contract deployed at address: {contract_address}")
print(f"Gas used: {tx_receipt.gasUsed}")

# Save contract configuration
config = {
    'address': contract_address,
    'abi': abi
}

with open('contract_config.json', 'w') as f:
    json.dump(config, f, indent=2)

print("\nContract configuration saved to contract_config.json")
print("\n" + "="*60)
print("DEPLOYMENT SUCCESSFUL!")
print("="*60)
print(f"\nContract Address: {contract_address}")
print("\nYou can now run the Flask application with: python app.py")
