# System Architecture

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                     (HTML/CSS/JavaScript)                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Assets  │  Create  │ Purchase │ Transfer │Marketplace│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FLASK BACKEND                           │
│                      (Python/Web3.py)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Endpoints                                   │  │
│  │  • /api/accounts      • /api/purchase                │  │
│  │  • /api/create-asset  • /api/transfer                │  │
│  │  • /api/assets        • /api/list-tokens             │  │
│  │  • /api/listings      • /api/buy-listing             │  │
│  │  • /api/balance       • /api/top-beneficiaries       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      WEB3 PROVIDER                           │
│                   (HTTP://127.0.0.1:7545)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GANACHE BLOCKCHAIN                        │
│                  (Local Ethereum Network)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Smart Contract: RealEstateToken.sol                 │  │
│  │  • Asset Management                                   │  │
│  │  • Token Operations                                   │  │
│  │  • Marketplace Logic                                  │  │
│  │  • Ownership Tracking                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Asset Creation Flow

```
User (Issuer)
    │
    ├─► Fill Asset Form (Name, Location, Value, Tokens)
    │
    ├─► Submit to Flask Backend
    │
    ├─► Backend calls createAsset() on Smart Contract
    │
    ├─► Smart Contract:
    │   • Validates input
    │   • Creates Asset struct
    │   • Assigns all tokens to issuer
    │   • Emits AssetCreated event
    │
    └─► Returns Asset ID to User
```

### 2. Purchase Flow (Initial Sale)

```
Investor                    Issuer
    │                          │
    ├─► Select Asset           │
    │                          │
    ├─► Enter Token Amount     │
    │                          │
    ├─► Send ETH ──────────────┼─► Receives ETH
    │                          │
    ├─► Receives Tokens ◄──────┤ Loses Tokens
    │                          │
    └─► Ownership Updated on Blockchain
```

### 3. Transfer Flow (No ETH)

```
Sender                    Receiver
    │                        │
    ├─► Select Asset         │
    │                        │
    ├─► Enter Recipient      │
    │                        │
    ├─► Enter Amount         │
    │                        │
    ├─► Loses Tokens ────────┼─► Receives Tokens
    │                        │
    │   (No ETH Exchange)    │
    │                        │
    └─► Ledger Updated on Blockchain
```

### 4. Marketplace Flow (Secondary Sale)

```
Seller (Investor A)         Buyer (Investor B)
    │                            │
    ├─► List Tokens              │
    │   • Set Price              │
    │   • Set Amount             │
    │                            │
    │                            ├─► Browse Listings
    │                            │
    │                            ├─► Select Listing
    │                            │
    │ ◄─── Receives ETH ─────────┤ Sends ETH
    │                            │
    ├─── Sends Tokens ──────────►│ Receives Tokens
    │                            │
    └─► Listing Removed from Marketplace
```

## Smart Contract Structure

```
RealEstateToken Contract
│
├── Data Structures
│   ├── Asset Struct
│   │   ├── id
│   │   ├── name
│   │   ├── location
│   │   ├── totalValue
│   │   ├── totalTokens
│   │   ├── tokenPrice
│   │   ├── issuer
│   │   ├── exists
│   │   └── createdAt
│   │
│   └── Listing Struct
│       ├── seller
│       ├── assetId
│       ├── tokenAmount
│       ├── pricePerToken
│       └── active
│
├── State Variables
│   ├── assets (mapping)
│   ├── balances (nested mapping)
│   ├── assetOwners (mapping to array)
│   ├── isOwner (nested mapping)
│   ├── listings (mapping)
│   ├── assetCount
│   └── listingCount
│
├── Core Functions
│   ├── createAsset()
│   ├── purchaseTokens()
│   ├── transferTokens()
│   ├── listTokensForSale()
│   ├── buyListedTokens()
│   └── cancelListing()
│
└── View Functions
    ├── getAsset()
    ├── getBalance()
    ├── getAssetOwners()
    ├── getTopBeneficiaries()
    ├── getAllListings()
    └── getTotalAssets()
```

## Token Lifecycle

```
1. CREATION
   ┌─────────────────┐
   │ Asset Created   │
   │ Tokens Minted   │
   │ Issuer Owns All │
   └─────────────────┘
           │
           ▼
2. INITIAL DISTRIBUTION
   ┌─────────────────┐
   │ Investors Buy   │
   │ from Issuer     │
   │ ETH → Issuer    │
   └─────────────────┘
           │
           ▼
3. TRANSFERS
   ┌─────────────────┐
   │ Free Transfers  │
   │ Between Users   │
   │ No ETH Exchange │
   └─────────────────┘
           │
           ▼
4. SECONDARY MARKET
   ┌─────────────────┐
   │ List for Sale   │
   │ P2P Trading     │
   │ ETH Exchange    │
   └─────────────────┘
           │
           ▼
5. OWNERSHIP TRACKING
   ┌─────────────────┐
   │ All Owners      │
   │ Top 10 Ranked   │
   │ Balance Queries │
   └─────────────────┘
```

## Security Model

```
Smart Contract Security
│
├── Input Validation
│   ├── Require statements
│   ├── Non-zero checks
│   └── Existence checks
│
├── Access Control
│   ├── Ownership verification
│   ├── Balance checks
│   └── Listing ownership
│
├── Financial Safety
│   ├── Sufficient balance checks
│   ├── Exact payment verification
│   └── Automatic refunds
│
└── State Management
    ├── Atomic transactions
    ├── Event emissions
    └── Consistent state updates
```

## Technology Stack Details

```
Frontend Layer
├── HTML5 (Structure)
├── CSS3 (Styling)
│   ├── CSS Variables
│   ├── Flexbox/Grid
│   ├── Animations
│   └── Responsive Design
└── JavaScript (Logic)
    ├── Fetch API
    ├── DOM Manipulation
    ├── Event Handling
    └── Async/Await

Backend Layer
├── Flask (Web Framework)
├── Web3.py (Blockchain Interface)
├── JSON (Data Exchange)
└── Python 3.11.9

Blockchain Layer
├── Solidity 0.8.0
├── Ganache (Local Network)
├── Web3 Provider
└── Smart Contracts

Development Tools
├── py-solc-x (Compiler)
├── solcx (Solidity Compiler)
└── Werkzeug (WSGI)
```

## Deployment Process

```
1. COMPILE
   ┌──────────────────┐
   │ Solidity Source  │
   │       ↓          │
   │ py-solc-x        │
   │       ↓          │
   │ Bytecode + ABI   │
   └──────────────────┘

2. DEPLOY
   ┌──────────────────┐
   │ Connect to       │
   │ Ganache          │
   │       ↓          │
   │ Deploy Contract  │
   │       ↓          │
   │ Get Address      │
   └──────────────────┘

3. CONFIGURE
   ┌──────────────────┐
   │ Save Address     │
   │ Save ABI         │
   │       ↓          │
   │ contract_config  │
   │ .json            │
   └──────────────────┘

4. RUN
   ┌──────────────────┐
   │ Load Config      │
   │       ↓          │
   │ Start Flask      │
   │       ↓          │
   │ Serve Frontend   │
   └──────────────────┘
```

## Network Architecture

```
┌─────────────────────────────────────────┐
│         User's Browser                   │
│    http://127.0.0.1:5000                │
└─────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────┐
│         Flask Server                     │
│         Port: 5000                       │
└─────────────────────────────────────────┘
                  │
                  │ Web3 RPC Calls
                  ▼
┌─────────────────────────────────────────┐
│         Ganache RPC Server              │
│    http://127.0.0.1:7545                │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  10 Test Accounts              │    │
│  │  Each with 100 ETH             │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Deployed Smart Contract       │    │
│  │  RealEstateToken               │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## File Structure

```
Blockchain/
│
├── contracts/
│   └── RealEstateToken.sol      [Smart Contract]
│
├── static/
│   ├── css/
│   │   └── style.css            [Styling]
│   └── js/
│       └── app.js               [Frontend Logic]
│
├── templates/
│   └── index.html               [UI Template]
│
├── app.py                       [Flask Backend]
├── deploy.py                    [Deployment Script]
├── requirements.txt             [Dependencies]
├── contract_config.json         [Generated Config]
│
└── Documentation/
    ├── README.md                [Main Documentation]
    ├── QUICKSTART.md            [Quick Start Guide]
    ├── TESTING_GUIDE.md         [Testing Instructions]
    └── ARCHITECTURE.md          [This File]
```

## Key Design Decisions

### 1. Why Ganache?
- Local development environment
- Fast transaction confirmation
- No real ETH required
- Easy account management
- Perfect for testing and demos

### 2. Why Flask?
- Lightweight and simple
- Easy integration with Web3.py
- Quick development
- Suitable for educational projects

### 3. Why Vanilla JavaScript?
- No framework overhead
- Direct DOM manipulation
- Easy to understand
- Fast loading times

### 4. Why Black & Gold Theme?
- Professional appearance
- Bitcoin/blockchain association
- High contrast for readability
- Premium feel for real estate

### 5. Why iOS-style Design?
- Modern and clean
- Familiar to users
- Smooth animations
- Card-based layouts

## Performance Considerations

### Transaction Speed
- Ganache: Instant block mining
- No network latency
- Immediate confirmations

### Scalability
- Current: Single contract
- Future: Multiple contracts per asset
- Gas optimization in sorting algorithm

### User Experience
- Loading indicators during transactions
- Toast notifications for feedback
- Real-time balance updates
- Smooth tab transitions

## Future Enhancements

1. **Multi-Asset Portfolios**
   - Track user's holdings across all assets
   - Portfolio value calculation

2. **Dividend Distribution**
   - Automatic profit sharing
   - Proportional to token holdings

3. **Governance**
   - Token holder voting
   - Property management decisions

4. **Integration**
   - MetaMask support
   - Testnet deployment
   - IPFS for asset documents

5. **Advanced Features**
   - Auction mechanism
   - Fractional listing (partial sales)
   - Time-locked transfers
   - Staking rewards

---

This architecture demonstrates a complete understanding of:
- ✅ Blockchain fundamentals
- ✅ Smart contract design
- ✅ DApp development
- ✅ Full-stack integration
- ✅ User experience design
- ✅ Security best practices
