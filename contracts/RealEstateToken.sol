// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RealEstateToken {
    
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
    
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => mapping(address => uint256)) public balances;
    mapping(uint256 => address[]) private assetOwners;
    mapping(uint256 => mapping(address => bool)) private isOwner;
    mapping(uint256 => Listing) public listings;
    mapping(string => bool) private assetNameExists;
    
    uint256 public assetCount;
    uint256 public listingCount;
    
    event AssetCreated(uint256 indexed assetId, string name, address indexed issuer, uint256 totalTokens);
    event TokensPurchased(uint256 indexed assetId, address indexed buyer, uint256 amount, uint256 totalCost);
    event TokensTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 amount);
    event TokensListed(uint256 indexed listingId, uint256 indexed assetId, address indexed seller, uint256 amount, uint256 price);
    event TokensSold(uint256 indexed listingId, uint256 indexed assetId, address indexed seller, address buyer, uint256 amount, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId);
    
    function createAsset(
        string memory _name,
        string memory _location,
        uint256 _totalValue,
        uint256 _totalTokens
    ) public returns (uint256) {
        require(_totalTokens > 0, "Total tokens must be greater than 0");
        require(_totalValue > 0, "Total value must be greater than 0");
        require(!assetNameExists[_name], "Asset name already exists");
        
        assetCount++;
        uint256 tokenPrice = _totalValue / _totalTokens;
        assetNameExists[_name] = true;
        
        assets[assetCount] = Asset({
            id: assetCount,
            name: _name,
            location: _location,
            totalValue: _totalValue,
            totalTokens: _totalTokens,
            tokenPrice: tokenPrice,
            issuer: msg.sender,
            exists: true,
            createdAt: block.timestamp
        });
        
        balances[assetCount][msg.sender] = _totalTokens;
        assetOwners[assetCount].push(msg.sender);
        isOwner[assetCount][msg.sender] = true;
        
        emit AssetCreated(assetCount, _name, msg.sender, _totalTokens);
        return assetCount;
    }
    
    function purchaseTokens(uint256 _assetId, uint256 _amount) public payable {
        require(assets[_assetId].exists, "Asset does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        Asset memory asset = assets[_assetId];
        require(msg.sender != asset.issuer, "Issuer cannot purchase their own tokens");
        require(balances[_assetId][asset.issuer] >= _amount, "Insufficient tokens available");
        
        uint256 totalCost = asset.tokenPrice * _amount;
        require(msg.value >= totalCost, "Insufficient payment");
        
        balances[_assetId][asset.issuer] -= _amount;
        balances[_assetId][msg.sender] += _amount;
        
        if (!isOwner[_assetId][msg.sender]) {
            assetOwners[_assetId].push(msg.sender);
            isOwner[_assetId][msg.sender] = true;
        }
        
        payable(asset.issuer).transfer(totalCost);
        
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(_assetId, msg.sender, _amount, totalCost);
    }
    
    function transferTokens(uint256 _assetId, address _to, uint256 _amount) public {
        require(assets[_assetId].exists, "Asset does not exist");
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        require(_amount > 0, "Amount must be greater than 0");
        require(balances[_assetId][msg.sender] >= _amount, "Insufficient balance");
        
        balances[_assetId][msg.sender] -= _amount;
        balances[_assetId][_to] += _amount;
        
        if (!isOwner[_assetId][_to]) {
            assetOwners[_assetId].push(_to);
            isOwner[_assetId][_to] = true;
        }
        
        emit TokensTransferred(_assetId, msg.sender, _to, _amount);
    }
    
    function listTokensForSale(uint256 _assetId, uint256 _amount, uint256 _pricePerToken) public returns (uint256) {
        require(assets[_assetId].exists, "Asset does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        require(_pricePerToken > 0, "Price must be greater than 0");
        require(balances[_assetId][msg.sender] >= _amount, "Insufficient balance");
        
        listingCount++;
        
        listings[listingCount] = Listing({
            seller: msg.sender,
            assetId: _assetId,
            tokenAmount: _amount,
            pricePerToken: _pricePerToken,
            active: true
        });
        
        emit TokensListed(listingCount, _assetId, msg.sender, _amount, _pricePerToken);
        return listingCount;
    }
    
    function buyListedTokens(uint256 _listingId) public payable {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing is not active");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        
        uint256 totalPrice = listing.tokenAmount * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");
        require(balances[listing.assetId][listing.seller] >= listing.tokenAmount, "Seller has insufficient tokens");
        
        balances[listing.assetId][listing.seller] -= listing.tokenAmount;
        balances[listing.assetId][msg.sender] += listing.tokenAmount;
        
        if (!isOwner[listing.assetId][msg.sender]) {
            assetOwners[listing.assetId].push(msg.sender);
            isOwner[listing.assetId][msg.sender] = true;
        }
        
        listing.active = false;
        
        payable(listing.seller).transfer(totalPrice);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit TokensSold(_listingId, listing.assetId, listing.seller, msg.sender, listing.tokenAmount, totalPrice);
    }
    
    function cancelListing(uint256 _listingId) public {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only seller can cancel listing");
        
        listing.active = false;
        emit ListingCancelled(_listingId);
    }
    
    function getAsset(uint256 _assetId) public view returns (
        uint256 id,
        string memory name,
        string memory location,
        uint256 totalValue,
        uint256 totalTokens,
        uint256 tokenPrice,
        address issuer,
        uint256 createdAt
    ) {
        require(assets[_assetId].exists, "Asset does not exist");
        Asset memory asset = assets[_assetId];
        return (
            asset.id,
            asset.name,
            asset.location,
            asset.totalValue,
            asset.totalTokens,
            asset.tokenPrice,
            asset.issuer,
            asset.createdAt
        );
    }
    
    function getBalance(uint256 _assetId, address _owner) public view returns (uint256) {
        return balances[_assetId][_owner];
    }
    
    function getAssetOwners(uint256 _assetId) public view returns (address[] memory) {
        require(assets[_assetId].exists, "Asset does not exist");
        return assetOwners[_assetId];
    }
    
    function getTopBeneficiaries(uint256 _assetId, uint256 _limit) public view returns (
        address[] memory owners,
        uint256[] memory tokenBalances
    ) {
        require(assets[_assetId].exists, "Asset does not exist");
        
        address[] memory allOwners = assetOwners[_assetId];
        uint256 ownerCount = allOwners.length;
        uint256 limit = _limit > ownerCount ? ownerCount : _limit;
        
        address[] memory sortedOwners = new address[](ownerCount);
        uint256[] memory sortedBalances = new uint256[](ownerCount);
        
        for (uint256 i = 0; i < ownerCount; i++) {
            sortedOwners[i] = allOwners[i];
            sortedBalances[i] = balances[_assetId][allOwners[i]];
        }
        
        for (uint256 i = 0; i < ownerCount; i++) {
            for (uint256 j = i + 1; j < ownerCount; j++) {
                if (sortedBalances[j] > sortedBalances[i]) {
                    uint256 tempBalance = sortedBalances[i];
                    sortedBalances[i] = sortedBalances[j];
                    sortedBalances[j] = tempBalance;
                    
                    address tempOwner = sortedOwners[i];
                    sortedOwners[i] = sortedOwners[j];
                    sortedOwners[j] = tempOwner;
                }
            }
        }
        
        address[] memory topOwners = new address[](limit);
        uint256[] memory topBalances = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            topOwners[i] = sortedOwners[i];
            topBalances[i] = sortedBalances[i];
        }
        
        return (topOwners, topBalances);
    }
    
    function getAllListings() public view returns (
        uint256[] memory listingIds,
        address[] memory sellers,
        uint256[] memory assetIds,
        uint256[] memory amounts,
        uint256[] memory prices,
        bool[] memory activeStatus
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= listingCount; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        listingIds = new uint256[](activeCount);
        sellers = new address[](activeCount);
        assetIds = new uint256[](activeCount);
        amounts = new uint256[](activeCount);
        prices = new uint256[](activeCount);
        activeStatus = new bool[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= listingCount; i++) {
            if (listings[i].active) {
                listingIds[index] = i;
                sellers[index] = listings[i].seller;
                assetIds[index] = listings[i].assetId;
                amounts[index] = listings[i].tokenAmount;
                prices[index] = listings[i].pricePerToken;
                activeStatus[index] = listings[i].active;
                index++;
            }
        }
        
        return (listingIds, sellers, assetIds, amounts, prices, activeStatus);
    }
    
    function getTotalAssets() public view returns (uint256) {
        return assetCount;
    }
}
