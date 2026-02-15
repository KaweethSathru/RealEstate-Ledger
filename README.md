# Real Estate Tokenization DApp

A blockchain-based decentralized application for tokenizing real estate assets, enabling fractional ownership, trading, and transparent ownership tracking.

## 🌟 Features

### Core Functionality
- **Asset Definition**: Create and tokenize real estate properties with detailed information
- **Token Creation**: Generate native tokens representing fractional shares of assets
- **Purchase System**: Buy tokens directly from the issuer (initial sale)
- **Transfer Mechanism**: Send tokens to other addresses without ETH exchange
- **Marketplace**: List and sell tokens to other investors with ETH settlement
- **Analytics Dashboard**: View total assets, ownership distribution, and top 10 beneficiaries

### Technical Highlights
- Smart contract written in Solidity 0.8.0
- Flask backend with RESTful API
- Web3.py for blockchain interaction
- Ganache for local Ethereum development
- Sleek black & gold iOS-style UI/UX

## 📋 Requirements

- Python 3.11.9
- Ganache (for local blockchain)
- Node.js (for Ganache installation)

## 🚀 Installation & Setup

### Step 1: Install Ganache

Download and install Ganache from: https://trufflesuite.com/ganache/

**Configure Ganache:**
1. Open Ganache
2. Create a new workspace or quickstart
3. Ensure it's running on `HTTP://127.0.0.1:7545`
4. Note: Ganache provides 10 accounts with 100 ETH each

### Step 2: Install Python Dependencies

```bash
# Navigate to project directory
cd "d:\Education\Campus Notes\Top-Up\1st Sem\Assigment\Blockchain\test pro 2\Blockchain"

# Install required packages
pip install -r requirements.txt
```

### Step 3: Deploy Smart Contract

```bash
# Deploy the contract to Ganache
python deploy.py
```

This will:
- Compile the Solidity smart contract
- Deploy it to your local Ganache blockchain
- Save the contract address and ABI to `contract_config.json`

### Step 4: Run the Application

```bash
# Start the Flask server
python app.py
```

The application will be available at: `http://127.0.0.1:5000`

## 📖 User Guide

### Creating an Asset

1. Navigate to the **Create Asset** tab
2. Fill in the asset details:
   - **Asset Name**: e.g., "Luxury Apartment Downtown"
   - **Location**: e.g., "New York, NY"
   - **Total Value**: Total property value in ETH
   - **Total Tokens**: Number of fractional tokens to create
3. The token price is automatically calculated
4. Click **Create Asset**
5. The issuer receives all tokens initially

### Purchasing Tokens (Initial Sale)

**Scenario**: Investor buys tokens from the issuer

1. Go to the **Purchase** tab
2. Select an asset from the dropdown
3. View asset details and available tokens from issuer
4. Enter the number of tokens to purchase
5. Review the total cost in ETH
6. Click **Purchase Tokens**
7. ETH is transferred to the issuer, tokens to the buyer

### Transferring Tokens

**Scenario**: Free transfer between addresses (no ETH exchange)

1. Navigate to the **Transfer** tab
2. Select the asset
3. View your current token balance
4. Enter the recipient's address
5. Enter the number of tokens to transfer
6. Click **Transfer Tokens**
7. Only token ownership updates on the ledger (no ETH moves)

### Selling Tokens (Secondary Market)

**Scenario**: Investor A wants to cash out, Investor B wants to buy

#### Listing Tokens for Sale:
1. Go to the **Marketplace** tab
2. Select the asset you own tokens for
3. Enter the number of tokens to sell
4. Set your price per token in ETH
5. Click **List Tokens**
6. Your listing appears in the marketplace

#### Buying Listed Tokens:
1. Browse active listings in the **Marketplace** tab
2. View seller address, token amount, and price
3. Click **Buy Tokens** on a listing
4. The contract facilitates the swap:
   - ETH goes from buyer to seller
   - Tokens go from seller to buyer
5. Listing is automatically removed

#### Cancelling a Listing:
1. Find your own listing (marked with your address)
2. Click **Cancel Listing**
3. Tokens remain in your wallet

### Analytics & Insights

1. Navigate to the **Analytics** tab
2. Select an asset
3. Click **Load Analytics**
4. View:
   - Total number of owners
   - Total tokens in circulation
   - **Top 10 Beneficiaries** (ranked by token holdings)
   - Complete list of all owners with their balances

## 🏗️ Smart Contract Architecture

### Key Functions

#### Asset Management
- `createAsset()`: Define and tokenize a new real estate asset
- `getAsset()`: Retrieve asset details
- `getTotalAssets()`: Get total number of assets created

#### Token Operations
- `purchaseTokens()`: Buy tokens from issuer (initial sale)
- `transferTokens()`: Transfer tokens without ETH exchange
- `getBalance()`: Check token balance for an address

#### Marketplace
- `listTokensForSale()`: Create a listing for tokens
- `buyListedTokens()`: Purchase tokens from a listing
- `cancelListing()`: Remove a listing
- `getAllListings()`: Get all active listings

#### Analytics
- `getAssetOwners()`: Get all owners of an asset
- `getTopBeneficiaries()`: Get top N token holders (sorted)

### Data Structures

```solidity
struct Asset {
    uint256 id;
    string name;
    string location;
    uint256 totalValue;
    uint256 totalTokens;
    uint256 tokenPrice;
    address issuer;
    bool exists;
    uint256 createdAt;
}

struct Listing {
    address seller;
    uint256 assetId;
    uint256 tokenAmount;
    uint256 pricePerToken;
    bool active;
}
```

## 🎨 Design Philosophy

### Color Scheme
- **Primary Gold**: #FFD700 (Bitcoin-inspired)
- **Dark Background**: #000000 to #1a1a1a gradient
- **Accent Colors**: Gold variations for highlights

### UI/UX Principles
- iOS-style sleek design with rounded corners
- Card-based layout for content organization
- Smooth animations and transitions
- Clear visual hierarchy
- Responsive design for all screen sizes

## 🔒 Security Features

- Input validation on all forms
- Smart contract require statements for safety checks
- Prevention of self-transfers and self-purchases
- Balance verification before transactions
- Automatic refund of excess ETH sent

## 📊 Assessment Requirements Coverage

✅ **Define an Asset**: Create asset with name, location, value, and tokens
✅ **Tokenize Asset**: Generate fractional tokens representing ownership
✅ **Purchase**: Buy tokens from issuer with ETH payment
✅ **Transfer**: Send tokens to other addresses (no ETH exchange)
✅ **Sell**: List tokens for sale, other users can buy with ETH
✅ **Calculate Total Assets**: View total number of assets created
✅ **Calculate Owners**: View all owners of each asset
✅ **Top 10 Beneficiaries**: Ranked list of largest token holders

## 🛠️ Technology Stack

- **Smart Contract**: Solidity 0.8.0
- **Blockchain**: Ethereum (Ganache local network)
- **Backend**: Flask (Python 3.11.9)
- **Web3 Library**: Web3.py
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Compiler**: py-solc-x

## 📁 Project Structure

```
Blockchain/
├── contracts/
│   └── RealEstateToken.sol    # Smart contract
├── static/
│   ├── css/
│   │   └── style.css           # Styling
│   └── js/
│       └── app.js              # Frontend logic
├── templates/
│   └── index.html              # Main UI
├── app.py                      # Flask application
├── deploy.py                   # Deployment script
├── requirements.txt            # Python dependencies
└── README.md                   # Documentation
```

## 🧪 Testing the Application

### Test Scenario 1: Complete Asset Lifecycle
1. Create an asset with Account 1 (issuer)
2. Purchase tokens with Account 2 (investor)
3. Transfer some tokens from Account 2 to Account 3
4. List tokens for sale from Account 2
5. Buy listed tokens with Account 4
6. View analytics to see all owners and top beneficiaries

### Test Scenario 2: Marketplace Operations
1. Create multiple assets
2. Have different accounts purchase tokens
3. List tokens at various prices
4. Test buying and cancelling listings
5. Verify ETH and token balances update correctly

## 🐛 Troubleshooting

### Ganache Connection Issues
- Ensure Ganache is running on port 7545
- Check that the RPC server is enabled
- Verify network ID matches

### Contract Deployment Fails
- Make sure Ganache accounts have sufficient ETH
- Check that Solidity compiler installed correctly
- Verify contract syntax is valid

### Transaction Errors
- Ensure selected account has sufficient ETH balance
- Check that you own enough tokens for transfers/listings
- Verify recipient addresses are valid

## 📝 Notes

- All ETH values are displayed with appropriate decimal precision
- Token balances are whole numbers (no decimals)
- Transaction confirmations are automatic via Web3.py
- Gas costs are handled automatically by Ganache

## 🎓 Academic Context

This project demonstrates:
- **Decentralization**: No central authority controls asset ownership
- **Transparency**: All transactions recorded on blockchain
- **Smart Contract Logic**: Automated, trustless execution
- **Token Economics**: Fractional ownership model
- **DApp Architecture**: Full-stack blockchain application

## 📄 License

This project is created for educational purposes as part of a blockchain development course.

## 👨‍💻 Development

Built with attention to:
- Clean, readable code
- Comprehensive error handling
- User-friendly interface
- Efficient smart contract design
- Best practices in blockchain development

---

**Ready to tokenize real estate? Start Ganache and run the application!** 🚀
