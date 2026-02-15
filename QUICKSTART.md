# Quick Start Guide

## Prerequisites
1. Install Ganache from https://trufflesuite.com/ganache/
2. Ensure Python 3.11.9 is installed

## Setup Steps

### 1. Start Ganache
- Open Ganache application
- Click "Quickstart" or create new workspace
- Ensure it's running on HTTP://127.0.0.1:7545

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Deploy Smart Contract
```bash
python deploy.py
```
Wait for "DEPLOYMENT SUCCESSFUL!" message

### 4. Run Application
```bash
python app.py
```

### 5. Open Browser
Navigate to: http://127.0.0.1:5000

## Quick Test Flow

1. **Create Asset** (Account 1)
   - Name: "Downtown Apartment"
   - Location: "New York, NY"
   - Value: 100 ETH
   - Tokens: 1000

2. **Purchase Tokens** (Switch to Account 2)
   - Select the asset
   - Buy 100 tokens
   - Pay 10 ETH

3. **Transfer Tokens** (Account 2)
   - Copy Account 3 address from dropdown
   - Transfer 20 tokens (free, no ETH)

4. **List for Sale** (Account 2)
   - List 30 tokens
   - Price: 0.15 ETH per token

5. **Buy from Marketplace** (Switch to Account 4)
   - Buy the listing
   - Pay 4.5 ETH total

6. **View Analytics**
   - Select the asset
   - See all owners
   - View top 10 beneficiaries

## Key Features to Test

✅ Asset creation and tokenization
✅ Initial purchase from issuer
✅ Free token transfers (no ETH)
✅ Marketplace listing and buying
✅ Owner tracking
✅ Top beneficiaries ranking

## Common Issues

**"Failed to connect to Ganache"**
- Make sure Ganache is running
- Check port is 7545

**"Insufficient balance"**
- Switch to an account with more ETH
- Check token balance before transfer/listing

**"Contract not deployed"**
- Run `python deploy.py` first
- Check for contract_config.json file

## Account Management

- Use the dropdown to switch between Ganache accounts
- Each account starts with 100 ETH
- Balance updates after each transaction

Enjoy your blockchain real estate platform! 🏠⛓️
