# Troubleshooting Guide

## Common Issues and Solutions

### 1. Ganache Connection Issues

#### Problem: "Failed to connect to Ganache"
**Symptoms:**
- Error message when loading accounts
- Cannot deploy contract
- Transactions fail immediately

**Solutions:**
```bash
# Check if Ganache is running
# Open Ganache application and verify:
1. RPC Server is running
2. Port is 7545
3. Network ID is displayed
4. Accounts are visible

# Test connection manually:
python -c "from web3 import Web3; w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545')); print(w3.is_connected())"
```

**Expected Output:** `True`

---

### 2. Contract Deployment Failures

#### Problem: "Contract deployment failed"
**Symptoms:**
- deploy.py script crashes
- No contract_config.json created
- Error during compilation

**Solution 1: Solidity Compiler Issues**
```bash
# Reinstall py-solc-x
pip uninstall py-solc-x
pip install py-solc-x==2.0.2

# Clear solc cache
python -c "from solcx import install_solc; install_solc('0.8.0', show_progress=True)"
```

**Solution 2: Ganache Account Issues**
```bash
# Verify accounts have ETH
python -c "from web3 import Web3; w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545')); print(w3.eth.get_balance(w3.eth.accounts[0]))"
```

**Expected Output:** Large number (100 ETH in Wei)

**Solution 3: File Path Issues**
```bash
# Ensure you're in the correct directory
cd "d:\Education\Campus Notes\Top-Up\1st Sem\Assigment\Blockchain\test pro 2\Blockchain"

# Verify contract file exists
dir contracts\RealEstateToken.sol
```

---

### 3. Flask Application Won't Start

#### Problem: "Flask app crashes on startup"
**Symptoms:**
- ImportError messages
- Module not found errors
- Port already in use

**Solution 1: Missing Dependencies**
```bash
# Reinstall all requirements
pip install -r requirements.txt --force-reinstall
```

**Solution 2: Port Conflict**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process or change port in app.py:
# app.run(debug=True, port=5001)
```

**Solution 3: Missing Config File**
```bash
# Ensure contract_config.json exists
dir contract_config.json

# If missing, redeploy:
python deploy.py
```

---

### 4. Transaction Failures

#### Problem: "Transaction failed" or "Insufficient funds"
**Symptoms:**
- Error toast notification
- Transaction doesn't complete
- Balance doesn't update

**Solution 1: Insufficient ETH**
```bash
# Check account balance
# In browser console:
console.log(document.getElementById('accountBalance').textContent)

# Switch to an account with more ETH
# Or reset Ganache to restore 100 ETH per account
```

**Solution 2: Insufficient Tokens**
```bash
# Verify token balance before transfer/listing
# Go to Transfer or Marketplace tab
# Check "Your Balance" display

# If zero, purchase tokens first
```

**Solution 3: Gas Limit Issues**
```bash
# Ganache should handle gas automatically
# If issues persist, restart Ganache:
1. Close Ganache
2. Reopen and create new workspace
3. Redeploy contract: python deploy.py
4. Restart Flask: python app.py
```

---

### 5. UI Not Loading Properly

#### Problem: "Blank page" or "Styles not loading"
**Symptoms:**
- White screen
- No styling
- JavaScript errors in console

**Solution 1: Check Flask Routes**
```bash
# Verify Flask is serving static files
# Open browser console (F12)
# Check for 404 errors

# Ensure folder structure:
static/
  css/
    style.css
  js/
    app.js
templates/
  index.html
```

**Solution 2: Clear Browser Cache**
```bash
# Hard refresh:
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# Or clear cache:
Browser Settings → Clear browsing data → Cached images and files
```

**Solution 3: Check Console Errors**
```javascript
// Open browser console (F12)
// Look for errors like:
// - "Failed to fetch"
// - "Unexpected token"
// - "Cannot read property"

// Common fix: Restart Flask app
```

---

### 6. Account Selection Issues

#### Problem: "Cannot switch accounts" or "Balance not updating"
**Symptoms:**
- Dropdown doesn't change
- Balance shows wrong amount
- Transactions use wrong account

**Solution:**
```javascript
// Refresh the page
// Or manually reload accounts:
// In browser console:
location.reload()

// Check if accounts loaded:
console.log(accounts)
```

---

### 7. Asset Not Appearing

#### Problem: "Created asset doesn't show up"
**Symptoms:**
- Success message appears
- Asset not in Assets tab
- Total Assets count doesn't increase

**Solution:**
```bash
# Check transaction was mined
# In Ganache, go to "Transactions" tab
# Verify recent transaction exists

# Refresh Assets tab
# Or reload page

# Check contract state:
# In browser console:
fetch('/api/assets').then(r => r.json()).then(console.log)
```

---

### 8. Marketplace Listing Issues

#### Problem: "Listing doesn't appear" or "Cannot buy listing"
**Symptoms:**
- Listed tokens don't show
- Buy button doesn't work
- Listing shows but can't purchase

**Solution 1: Listing Not Active**
```javascript
// Check listing status
fetch('/api/listings').then(r => r.json()).then(console.log)

// Verify listing.active === true
```

**Solution 2: Trying to Buy Own Listing**
```bash
# You cannot buy your own listing
# Switch to a different account
# Then try purchasing
```

**Solution 3: Seller Doesn't Have Tokens**
```bash
# Seller may have transferred tokens after listing
# Listing will fail if seller balance < listed amount
# Seller should cancel listing
```

---

### 9. Analytics Not Loading

#### Problem: "Analytics shows no data" or "Top beneficiaries empty"
**Symptoms:**
- Empty beneficiaries list
- Zero owners shown
- Load Analytics button does nothing

**Solution:**
```bash
# Ensure asset has owners
# At least issuer should own tokens

# Check if asset ID is valid
# Select asset from dropdown first

# Verify API response:
# In browser console:
fetch('/api/asset-owners/1').then(r => r.json()).then(console.log)
```

---

### 10. Python Version Issues

#### Problem: "Python version incompatible"
**Symptoms:**
- Syntax errors
- Module import failures
- Unexpected behavior

**Solution:**
```bash
# Check Python version
python --version

# Should show: Python 3.11.9

# If different, install correct version:
# Download from python.org
# Or use pyenv/conda to manage versions

# Create virtual environment:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### 11. Web3 Connection Errors

#### Problem: "Web3 provider error" or "Contract not found"
**Symptoms:**
- Cannot call contract functions
- "Contract not deployed" errors
- ABI errors

**Solution:**
```bash
# Verify contract_config.json exists and is valid
type contract_config.json

# Should show JSON with address and abi

# If corrupted, redeploy:
del contract_config.json
python deploy.py

# Restart Flask:
python app.py
```

---

### 12. Transfer Not Working

#### Problem: "Transfer fails" or "Recipient not receiving tokens"
**Symptoms:**
- Error message on transfer
- Tokens don't move
- Balance unchanged

**Solution 1: Invalid Address**
```bash
# Ensure recipient address is valid Ethereum address
# Should start with 0x
# Should be 42 characters long

# Copy address from account dropdown
# Don't type manually
```

**Solution 2: Transferring to Self**
```bash
# Cannot transfer to your own address
# Smart contract prevents this
# Use different recipient
```

**Solution 3: Insufficient Balance**
```bash
# Check your token balance first
# Cannot transfer more than you own
# Reduce transfer amount
```

---

## Debugging Tips

### Enable Debug Mode

**Flask Debug:**
```python
# In app.py, ensure:
app.run(debug=True, port=5000)

# This shows detailed error messages
```

**Browser Console:**
```javascript
// Open Developer Tools (F12)
// Check Console tab for JavaScript errors
// Check Network tab for API call failures
```

**Ganache Logs:**
```bash
# In Ganache, go to "Logs" tab
# View all transactions and errors
# Check gas usage and reverts
```

### Test API Endpoints Manually

```bash
# Test accounts endpoint
curl http://127.0.0.1:5000/api/accounts

# Test assets endpoint
curl http://127.0.0.1:5000/api/assets

# Test specific asset
curl http://127.0.0.1:5000/api/asset/1
```

### Verify Smart Contract State

```python
# Create test script: test_contract.py
from web3 import Web3
import json

web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

with open('contract_config.json', 'r') as f:
    config = json.load(f)

contract = web3.eth.contract(
    address=config['address'],
    abi=config['abi']
)

# Test functions
print("Total Assets:", contract.functions.getTotalAssets().call())
print("Asset 1:", contract.functions.getAsset(1).call())
```

---

## Reset Everything

If all else fails, complete reset:

```bash
# 1. Stop Flask (Ctrl+C)

# 2. Close Ganache

# 3. Delete generated files
del contract_config.json

# 4. Restart Ganache
# Create new workspace or quickstart

# 5. Redeploy contract
python deploy.py

# 6. Restart Flask
python app.py

# 7. Hard refresh browser
# Ctrl + Shift + R
```

---

## Performance Issues

### Slow Transactions
```bash
# Ganache should be instant
# If slow:
1. Close other applications
2. Restart Ganache
3. Use "Quickstart" instead of workspace
```

### High Memory Usage
```bash
# Flask debug mode uses more memory
# For production, disable debug:
app.run(debug=False, port=5000)
```

### Browser Lag
```bash
# Too many console logs
# Clear console (Ctrl+L)
# Disable verbose logging in app.js
```

---

## Getting Help

### Check Logs
1. **Flask Console**: Shows API errors
2. **Browser Console**: Shows JavaScript errors
3. **Ganache Logs**: Shows blockchain errors

### Verify Setup
```bash
# Checklist:
☐ Ganache running on port 7545
☐ Python 3.11.9 installed
☐ All dependencies installed
☐ Contract deployed successfully
☐ contract_config.json exists
☐ Flask running on port 5000
☐ Browser opened to correct URL
```

### Test Basic Functionality
```bash
# 1. Can you see accounts? → Check Ganache connection
# 2. Can you create asset? → Check contract deployment
# 3. Can you purchase? → Check account has ETH
# 4. Can you transfer? → Check token balance
# 5. Can you list? → Check token ownership
```

---

## Error Messages Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Asset does not exist" | Invalid asset ID | Use valid asset ID from Assets tab |
| "Insufficient tokens available" | Issuer sold all tokens | Wait for marketplace listings |
| "Insufficient payment" | Not enough ETH sent | Check total cost and account balance |
| "Insufficient balance" | Not enough tokens | Purchase or receive tokens first |
| "Cannot transfer to yourself" | Same sender/recipient | Use different address |
| "Invalid recipient address" | Malformed address | Use valid Ethereum address |
| "Listing is not active" | Already sold/cancelled | Find different listing |
| "Cannot buy your own listing" | Same buyer/seller | Switch to different account |
| "Only seller can cancel listing" | Wrong account | Switch to listing owner account |

---

## Prevention Tips

1. **Always check balances** before transactions
2. **Use account dropdown** to copy addresses
3. **Wait for confirmations** before next action
4. **Keep Ganache running** during entire session
5. **Don't modify contract** while app is running
6. **Refresh page** if something seems stuck
7. **Check console** for error messages
8. **Test with small amounts** first
9. **Keep backup** of contract_config.json
10. **Document** any custom changes

---

## Still Having Issues?

1. **Read error message carefully**
2. **Check this guide** for specific error
3. **Try reset procedure** above
4. **Verify all prerequisites** are met
5. **Test with fresh Ganache workspace**
6. **Check Python and package versions**
7. **Review code** for any modifications
8. **Test API endpoints** individually

---

**Remember: Most issues are solved by restarting Ganache and redeploying the contract!**
