# Testing & Demonstration Guide

## Complete Feature Demonstration

### Setup Verification
1. ✅ Ganache running on port 7545
2. ✅ Contract deployed successfully
3. ✅ Flask app running on port 5000
4. ✅ Browser opened to http://127.0.0.1:5000

---

## Test Case 1: Asset Creation & Tokenization

**Objective**: Demonstrate asset definition and token creation

**Steps**:
1. Select **Account 1** from dropdown (this will be the issuer)
2. Navigate to **Create Asset** tab
3. Fill in details:
   ```
   Asset Name: Luxury Penthouse Manhattan
   Location: Manhattan, New York
   Total Value: 500 ETH
   Total Tokens: 10000
   ```
4. Observe calculated token price: 0.05 ETH per token
5. Click **Create Asset**
6. Wait for success notification
7. Note the Asset ID (should be 1)

**Expected Results**:
- ✅ Asset created successfully
- ✅ Account 1 receives all 10,000 tokens
- ✅ Account 1 ETH balance decreases (gas fees)
- ✅ Asset appears in Assets tab

**Verification**:
- Go to **Assets** tab
- See "Total Assets: 1"
- View asset card with all details

---

## Test Case 2: Initial Token Purchase

**Objective**: Demonstrate purchase function (Investor buys from Issuer)

**Steps**:
1. Switch to **Account 2** (this is the investor)
2. Note Account 2 starting balance (should be ~100 ETH)
3. Navigate to **Purchase** tab
4. Select "Luxury Penthouse Manhattan" from dropdown
5. View asset details displayed
6. Check "Available from Issuer": should show 10,000 tokens
7. Enter amount: 2000 tokens
8. Observe "Total Cost": 100 ETH
9. Click **Purchase Tokens**
10. Wait for transaction confirmation

**Expected Results**:
- ✅ Account 2 pays 100 ETH
- ✅ Account 2 receives 2,000 tokens
- ✅ Account 1 (issuer) receives 100 ETH
- ✅ Account 1 now has 8,000 tokens remaining
- ✅ Success notification shows total cost

**Verification**:
- Check Account 2 balance: ~0 ETH (100 spent + gas)
- Check Account 1 balance: ~200 ETH (100 initial + 100 received)
- Refresh Purchase tab: "Available from Issuer" now shows 8,000

---

## Test Case 3: Free Token Transfer

**Objective**: Demonstrate transfer function (No ETH exchange, only ledger update)

**Steps**:
1. Stay on **Account 2** (has 2,000 tokens)
2. Navigate to **Transfer** tab
3. Select "Luxury Penthouse Manhattan"
4. View balance: 2,000 tokens
5. Copy **Account 3** address from the account dropdown
6. Paste into "Recipient Address" field
7. Enter amount: 500 tokens
8. Read the info box: "No ETH will be exchanged"
9. Click **Transfer Tokens**

**Expected Results**:
- ✅ Account 2 token balance: 2,000 → 1,500
- ✅ Account 3 token balance: 0 → 500
- ✅ Account 2 ETH balance: unchanged (only gas)
- ✅ Account 3 ETH balance: unchanged
- ✅ Ownership updated on ledger

**Verification**:
- Switch to Account 3
- Go to Transfer tab
- Select the asset
- See balance: 500 tokens
- Check ETH balance: still ~100 ETH (no payment received)

---

## Test Case 4: Marketplace Listing

**Objective**: Demonstrate listing tokens for sale

**Steps**:
1. Switch to **Account 2** (has 1,500 tokens remaining)
2. Navigate to **Marketplace** tab
3. In "List Your Tokens for Sale" section:
   - Select "Luxury Penthouse Manhattan"
   - View balance: 1,500 tokens
   - Enter amount to sell: 800 tokens
   - Enter price per token: 0.08 ETH (60% markup)
   - Observe "Total Value": 64 ETH
4. Click **List Tokens**
5. Wait for confirmation

**Expected Results**:
- ✅ Listing created successfully
- ✅ Listing appears in "Active Listings" section
- ✅ Shows: 800 tokens at 0.08 ETH each
- ✅ Total price: 64 ETH
- ✅ Seller address matches Account 2
- ✅ "Cancel Listing" button visible (own listing)

**Verification**:
- Scroll down to Active Listings
- See listing card with all details
- Note the Listing ID

---

## Test Case 5: Buying from Marketplace

**Objective**: Demonstrate secondary market purchase (Investor B buys from Investor A)

**Steps**:
1. Switch to **Account 4** (new investor, missed initial sale)
2. Note Account 4 starting balance: ~100 ETH
3. Navigate to **Marketplace** tab
4. Find the listing from Account 2
5. Verify details:
   - 800 tokens available
   - 0.08 ETH per token
   - Total: 64 ETH
6. Click **Buy Tokens** button
7. Wait for transaction

**Expected Results**:
- ✅ Account 4 pays 64 ETH
- ✅ Account 4 receives 800 tokens
- ✅ Account 2 receives 64 ETH
- ✅ Account 2 loses 800 tokens
- ✅ Listing automatically removed
- ✅ Success notification shows total price

**Verification**:
- Account 4 balance: ~36 ETH (100 - 64)
- Account 4 tokens: 800
- Account 2 balance: increased by 64 ETH
- Account 2 tokens: 700 (1,500 - 800)
- Listing no longer in Active Listings

---

## Test Case 6: Multiple Assets & Purchases

**Objective**: Create multiple assets to test analytics

**Steps**:
1. Switch to **Account 5** (new issuer)
2. Create second asset:
   ```
   Asset Name: Beachfront Villa Miami
   Location: Miami, Florida
   Total Value: 300 ETH
   Total Tokens: 5000
   ```
3. Switch to **Account 6**
4. Purchase 1,000 tokens from Asset 2
5. Switch to **Account 7**
6. Purchase 1,500 tokens from Asset 2
7. Switch to **Account 8**
8. Purchase 500 tokens from Asset 1

**Expected Results**:
- ✅ Total Assets: 2
- ✅ Multiple investors in each asset
- ✅ Different ownership distributions

---

## Test Case 7: Analytics & Top Beneficiaries

**Objective**: Demonstrate ownership tracking and top 10 beneficiaries

**Steps**:
1. Navigate to **Analytics** tab
2. Select "Luxury Penthouse Manhattan" (Asset 1)
3. Click **Load Analytics**
4. Review displayed information:
   - Total Owners
   - Total Tokens
   - Top 10 Beneficiaries (ranked)
   - All Owners list

**Expected Results**:
- ✅ Shows all unique owners
- ✅ Top 10 ranked by token holdings
- ✅ Rank #1: Account 1 (issuer) with 8,000 tokens
- ✅ Rank #2: Account 4 with 800 tokens
- ✅ Rank #3: Account 2 with 700 tokens
- ✅ Rank #4: Account 3 with 500 tokens
- ✅ Rank #5: Account 8 with 500 tokens
- ✅ All owners section shows everyone with balances

**Verification**:
- Total tokens should equal 10,000
- Sum of all balances = total tokens
- Rankings are correct (descending order)

---

## Test Case 8: Listing Cancellation

**Objective**: Demonstrate cancelling a listing

**Steps**:
1. Switch to **Account 3** (has 500 tokens)
2. Navigate to **Marketplace** tab
3. List 200 tokens at 0.10 ETH each
4. Verify listing appears
5. Click **Cancel Listing** button
6. Confirm cancellation

**Expected Results**:
- ✅ Listing removed from marketplace
- ✅ Tokens remain in Account 3 wallet
- ✅ No ETH exchanged
- ✅ Success notification

---

## Test Case 9: Edge Cases & Validations

**Objective**: Test error handling

**Test 9.1 - Insufficient Balance**:
1. Try to purchase more tokens than issuer has
2. Expected: Error message "Insufficient tokens available"

**Test 9.2 - Insufficient ETH**:
1. Use an account with low ETH
2. Try to purchase expensive tokens
3. Expected: Transaction fails with insufficient funds

**Test 9.3 - Invalid Transfer**:
1. Try to transfer to your own address
2. Expected: Error "Cannot transfer to yourself"

**Test 9.4 - Transfer More Than Balance**:
1. Try to transfer more tokens than you own
2. Expected: Error "Insufficient balance"

**Test 9.5 - Buy Own Listing**:
1. Try to buy your own marketplace listing
2. Expected: Error "Cannot buy your own listing"

---

## Test Case 10: Complete Ownership Verification

**Objective**: Verify all requirements are met

**Checklist**:
- ✅ **Define Asset**: Created multiple assets with all details
- ✅ **Tokenize Asset**: Generated fractional tokens
- ✅ **Purchase**: Bought tokens from issuer with ETH
- ✅ **Transfer**: Sent tokens without ETH exchange
- ✅ **Sell**: Listed and sold tokens on marketplace
- ✅ **Calculate Assets**: View total asset count
- ✅ **Calculate Owners**: View all owners per asset
- ✅ **Top 10 Beneficiaries**: Ranked list displayed

---

## Performance Metrics

**Transaction Times** (approximate):
- Asset Creation: 1-2 seconds
- Token Purchase: 1-2 seconds
- Token Transfer: 1-2 seconds
- Marketplace Listing: 1-2 seconds
- Marketplace Purchase: 1-2 seconds

**Gas Costs** (Ganache default):
- All transactions use minimal gas
- Ganache provides unlimited gas for testing

---

## Visual Verification Points

**UI/UX Design**:
- ✅ Black and gold color scheme (Bitcoin-inspired)
- ✅ Sleek iOS-style rounded corners
- ✅ Smooth animations and transitions
- ✅ Clear visual hierarchy
- ✅ Responsive card layouts
- ✅ Professional typography
- ✅ Intuitive navigation tabs
- ✅ Real-time balance updates
- ✅ Loading indicators during transactions
- ✅ Toast notifications for feedback

---

## Demonstration Script for Presentation

**Introduction** (1 min):
"This is a blockchain-based real estate tokenization platform that enables fractional ownership of properties."

**Asset Creation** (2 min):
"First, I'll create a property and tokenize it into 10,000 shares..."

**Initial Purchase** (2 min):
"An investor can now purchase tokens directly from the issuer..."

**Free Transfer** (1 min):
"Token holders can transfer ownership without any ETH exchange..."

**Marketplace** (3 min):
"Investors can list their tokens for sale, and others can buy them..."

**Analytics** (2 min):
"The platform tracks all ownership and shows the top beneficiaries..."

**Conclusion** (1 min):
"This demonstrates a fully functional DApp with decentralized ownership tracking."

---

## Success Criteria

✅ All 5 core requirements implemented
✅ Smart contract functions correctly
✅ UI is intuitive and visually appealing
✅ Transactions execute successfully
✅ Ownership tracking is accurate
✅ Top 10 beneficiaries calculated correctly
✅ No critical bugs or errors
✅ Professional presentation quality

---

## Troubleshooting During Demo

**If transaction fails**:
- Check Ganache is running
- Verify account has sufficient ETH
- Refresh the page and try again

**If balance doesn't update**:
- Refresh the page
- Switch accounts and switch back

**If listing doesn't appear**:
- Wait a moment for blockchain confirmation
- Refresh the Marketplace tab

---

**Ready to demonstrate! Good luck with your assessment!** 🎓🚀
