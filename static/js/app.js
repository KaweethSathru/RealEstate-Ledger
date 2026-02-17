// Global variables
let currentAccount = null;
let accounts = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadAccounts();
    setupEventListeners();
    await loadAssets();
});

// Load accounts from Ganache
async function loadAccounts() {
    try {
        const response = await fetch('/api/accounts');
        const data = await response.json();
        
        if (data.success) {
            accounts = data.accounts;
            const select = document.getElementById('accountSelect');
            select.innerHTML = '';
            
            data.accounts.forEach((account, index) => {
                const option = document.createElement('option');
                option.value = account.address;
                option.textContent = `Account ${index + 1}: ${account.address.substring(0, 10)}... (${parseFloat(account.balance).toFixed(2)} ETH)`;
                select.appendChild(option);
            });
            
            currentAccount = data.accounts[0].address;
            updateAccountBalance();
        }
    } catch (error) {
        showToast('Failed to load accounts', 'error');
    }
}

// Update account balance display
function updateAccountBalance() {
    const account = accounts.find(acc => acc.address === currentAccount);
    if (account) {
        document.getElementById('accountBalance').textContent = parseFloat(account.balance).toFixed(4);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Account selection
    document.getElementById('accountSelect').addEventListener('change', (e) => {
        currentAccount = e.target.value;
        updateAccountBalance();
        loadAssets();
    });

    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Forms
    document.getElementById('createAssetForm').addEventListener('submit', handleCreateAsset);
    document.getElementById('purchaseForm').addEventListener('submit', handlePurchase);
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    document.getElementById('listTokensForm').addEventListener('submit', handleListTokens);
    
    // Dynamic calculations
    document.getElementById('assetValue').addEventListener('input', calculateTokenPrice);
    document.getElementById('assetTokens').addEventListener('input', calculateTokenPrice);
    document.getElementById('purchaseAmount').addEventListener('input', calculatePurchaseCost);
    document.getElementById('listAmount').addEventListener('input', calculateListValue);
    document.getElementById('listPrice').addEventListener('input', calculateListValue);
    
    // Asset selection changes
    document.getElementById('purchaseAssetSelect').addEventListener('change', handlePurchaseAssetChange);
    document.getElementById('transferAssetSelect').addEventListener('change', handleTransferAssetChange);
    document.getElementById('listAssetSelect').addEventListener('change', handleListAssetChange);
    
    // Analytics
    document.getElementById('loadAnalytics').addEventListener('click', loadAnalytics);
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'assets') {
        loadAssets();
    } else if (tabName === 'purchase') {
        loadAssetsForPurchase();
    } else if (tabName === 'transfer') {
        loadAssetsForTransfer();
    } else if (tabName === 'marketplace') {
        loadAssetsForListing();
        loadListings();
    } else if (tabName === 'analytics') {
        loadAssetsForAnalytics();
        loadTopAssetsChart();
        loadTopHoldersChart();
    }
}

// Calculate token price
function calculateTokenPrice() {
    const value = parseFloat(document.getElementById('assetValue').value) || 0;
    const tokens = parseFloat(document.getElementById('assetTokens').value) || 0;
    const price = tokens > 0 ? (value / tokens).toFixed(6) : 0;
    document.getElementById('calculatedPrice').textContent = price;
}

// Handle create asset
async function handleCreateAsset(e) {
    e.preventDefault();
    
    const name = document.getElementById('assetName').value;
    const location = document.getElementById('assetLocation').value;
    const totalValue = document.getElementById('assetValue').value;
    const totalTokens = document.getElementById('assetTokens').value;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/create-asset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                location,
                totalValue,
                totalTokens,
                account: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Asset created successfully! Asset ID: ${data.assetId}`, 'success');
            document.getElementById('createAssetForm').reset();
            calculateTokenPrice();
            await loadAccounts();
            await loadAssets();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to create asset', 'error');
    } finally {
        showLoading(false);
    }
}

// Load assets
async function loadAssets() {
    try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalAssets').textContent = data.assets.length;
            displayAssets(data.assets);
        }
    } catch (error) {
        showToast('Failed to load assets', 'error');
    }
}

// Display assets
function displayAssets(assets) {
    const container = document.getElementById('assetsList');
    
    if (assets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Assets Yet</h3>
                <p>Create your first tokenized real estate asset to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = assets.map(asset => `
        <div class="asset-card">
            <div class="asset-card-header">
                <div>
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-location">📍 ${asset.location}</div>
                </div>
                <div class="asset-id">ID: ${asset.id}</div>
            </div>
            <div class="asset-details">
                <div class="asset-detail-row">
                    <span class="asset-detail-label">Total Value</span>
                    <span class="asset-detail-value">${parseFloat(asset.totalValue).toFixed(2)} ETH</span>
                </div>
                <div class="asset-detail-row">
                    <span class="asset-detail-label">Total Tokens</span>
                    <span class="asset-detail-value">${asset.totalTokens}</span>
                </div>
                <div class="asset-detail-row">
                    <span class="asset-detail-label">Price per Token</span>
                    <span class="asset-detail-value">${parseFloat(asset.tokenPrice).toFixed(6)} ETH</span>
                </div>
            </div>
            <div class="asset-issuer">Issuer: ${asset.issuer}</div>
        </div>
    `).join('');
    
    displayTopIssuers(assets);
}

// Display top issuers
function displayTopIssuers(assets) {
    const issuerCounts = {};
    assets.forEach(asset => {
        issuerCounts[asset.issuer] = (issuerCounts[asset.issuer] || 0) + 1;
    });
    
    const sorted = Object.entries(issuerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const container = document.getElementById('topIssuers');
    
    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No issuers yet</p></div>';
        return;
    }
    
    container.innerHTML = sorted.map(([address, count], index) => `
        <div class="issuer-item">
            <div class="issuer-rank">${index + 1}</div>
            <div class="issuer-info">
                <div class="issuer-address">${address.substring(0, 10)}...${address.substring(address.length - 8)}</div>
                <div class="issuer-count">${count} asset${count > 1 ? 's' : ''}</div>
            </div>
        </div>
    `).join('');
}

// Load assets for purchase
async function loadAssetsForPurchase() {
    try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('purchaseAssetSelect');
            select.innerHTML = '<option value="">Select an asset...</option>';
            
            data.assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset.id;
                option.textContent = `${asset.name} - ${parseFloat(asset.tokenPrice).toFixed(6)} ETH per token`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        showToast('Failed to load assets', 'error');
    }
}

// Handle purchase asset change
async function handlePurchaseAssetChange(e) {
    const assetId = e.target.value;
    
    if (!assetId) {
        document.getElementById('purchaseAssetDetails').innerHTML = '';
        document.getElementById('issuerBalance').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`/api/asset/${assetId}`);
        const data = await response.json();
        
        if (data.success) {
            const asset = data.asset;
            
            // Get issuer balance
            const balanceResponse = await fetch(`/api/balance/${assetId}/${asset.issuer}`);
            const balanceData = await balanceResponse.json();
            
            document.getElementById('purchaseAssetDetails').innerHTML = `
                <div class="info-box">
                    <p><strong>Asset:</strong> ${asset.name}</p>
                    <p><strong>Location:</strong> ${asset.location}</p>
                    <p><strong>Token Price:</strong> ${parseFloat(asset.tokenPrice).toFixed(6)} ETH</p>
                </div>
            `;
            
            document.getElementById('issuerBalance').textContent = balanceData.balance;
        }
    } catch (error) {
        showToast('Failed to load asset details', 'error');
    }
}

// Calculate purchase cost
async function calculatePurchaseCost() {
    const assetId = document.getElementById('purchaseAssetSelect').value;
    const amount = parseFloat(document.getElementById('purchaseAmount').value) || 0;
    
    if (!assetId || amount === 0) {
        document.getElementById('purchaseTotalCost').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`/api/asset/${assetId}`);
        const data = await response.json();
        
        if (data.success) {
            const cost = parseFloat(data.asset.tokenPrice) * amount;
            document.getElementById('purchaseTotalCost').textContent = cost.toFixed(6);
        }
    } catch (error) {
        console.error('Failed to calculate cost');
    }
}

// Handle purchase
async function handlePurchase(e) {
    e.preventDefault();
    
    const assetId = document.getElementById('purchaseAssetSelect').value;
    const amount = document.getElementById('purchaseAmount').value;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetId,
                amount,
                account: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Tokens purchased successfully! Cost: ${data.totalCost} ETH`, 'success');
            document.getElementById('purchaseForm').reset();
            document.getElementById('purchaseAssetDetails').innerHTML = '';
            document.getElementById('purchaseTotalCost').textContent = '0';
            document.getElementById('issuerBalance').textContent = '0';
            await loadAccounts();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to purchase tokens', 'error');
    } finally {
        showLoading(false);
    }
}

// Load assets for transfer
async function loadAssetsForTransfer() {
    try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('transferAssetSelect');
            select.innerHTML = '<option value="">Select an asset...</option>';
            
            data.assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset.id;
                option.textContent = asset.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        showToast('Failed to load assets', 'error');
    }
}

// Handle transfer asset change
async function handleTransferAssetChange(e) {
    const assetId = e.target.value;
    
    if (!assetId) {
        document.getElementById('transferBalance').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`/api/balance/${assetId}/${currentAccount}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('transferBalance').textContent = data.balance;
        }
    } catch (error) {
        showToast('Failed to load balance', 'error');
    }
}

// Handle transfer
async function handleTransfer(e) {
    e.preventDefault();
    
    const assetId = document.getElementById('transferAssetSelect').value;
    const toAddress = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('transferAmount').value;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetId,
                toAddress,
                amount,
                fromAddress: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Tokens transferred successfully!', 'success');
            document.getElementById('transferForm').reset();
            document.getElementById('transferBalance').textContent = '0';
            await handleTransferAssetChange({ target: { value: assetId } });
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to transfer tokens', 'error');
    } finally {
        showLoading(false);
    }
}

// Load assets for listing
async function loadAssetsForListing() {
    try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('listAssetSelect');
            select.innerHTML = '<option value="">Select an asset...</option>';
            
            data.assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset.id;
                option.textContent = asset.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        showToast('Failed to load assets', 'error');
    }
}

// Handle list asset change
async function handleListAssetChange(e) {
    const assetId = e.target.value;
    
    if (!assetId) {
        document.getElementById('listBalance').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`/api/balance/${assetId}/${currentAccount}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('listBalance').textContent = data.balance;
        }
    } catch (error) {
        showToast('Failed to load balance', 'error');
    }
}

// Calculate list value
function calculateListValue() {
    const amount = parseFloat(document.getElementById('listAmount').value) || 0;
    const price = parseFloat(document.getElementById('listPrice').value) || 0;
    const total = amount * price;
    document.getElementById('listTotalValue').textContent = total.toFixed(6);
}

// Handle list tokens
async function handleListTokens(e) {
    e.preventDefault();
    
    const assetId = document.getElementById('listAssetSelect').value;
    const amount = document.getElementById('listAmount').value;
    const pricePerToken = document.getElementById('listPrice').value;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/list-tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetId,
                amount,
                pricePerToken,
                account: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Tokens listed successfully!', 'success');
            document.getElementById('listTokensForm').reset();
            document.getElementById('listBalance').textContent = '0';
            document.getElementById('listTotalValue').textContent = '0';
            await loadListings();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to list tokens', 'error');
    } finally {
        showLoading(false);
    }
}

// Load listings
async function loadListings() {
    try {
        const response = await fetch('/api/listings');
        const data = await response.json();
        
        if (data.success) {
            displayListings(data.listings);
        }
    } catch (error) {
        showToast('Failed to load listings', 'error');
    }
}

// Display listings
async function displayListings(listings) {
    const container = document.getElementById('listingsList');
    
    if (listings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Active Listings</h3>
                <p>List your tokens for sale to see them here</p>
            </div>
        `;
        return;
    }
    
    const listingsHTML = await Promise.all(listings.map(async listing => {
        const assetResponse = await fetch(`/api/asset/${listing.assetId}`);
        const assetData = await assetResponse.json();
        const assetName = assetData.success ? assetData.asset.name : `Asset #${listing.assetId}`;
        
        const totalPrice = (listing.tokenAmount * parseFloat(listing.pricePerToken)).toFixed(6);
        const isOwnListing = listing.seller.toLowerCase() === currentAccount.toLowerCase();
        
        return `
            <div class="listing-card">
                <div class="listing-header">
                    <div class="listing-asset-name">${assetName}</div>
                    <div class="listing-id">#${listing.listingId}</div>
                </div>
                <div class="listing-seller">Seller: ${listing.seller}</div>
                <div class="listing-details">
                    <div class="asset-detail-row">
                        <span class="asset-detail-label">Tokens Available</span>
                        <span class="asset-detail-value">${listing.tokenAmount}</span>
                    </div>
                    <div class="asset-detail-row">
                        <span class="asset-detail-label">Price per Token</span>
                        <span class="asset-detail-value">${parseFloat(listing.pricePerToken).toFixed(6)} ETH</span>
                    </div>
                    <div class="asset-detail-row">
                        <span class="asset-detail-label">Total Price</span>
                        <span class="asset-detail-value">${totalPrice} ETH</span>
                    </div>
                </div>
                <div class="listing-actions">
                    ${isOwnListing ? 
                        `<button class="btn-danger" onclick="cancelListing(${listing.listingId})">Cancel Listing</button>` :
                        `<button class="btn-primary" onclick="buyListing(${listing.listingId})">Buy Tokens</button>`
                    }
                </div>
            </div>
        `;
    }));
    
    container.innerHTML = listingsHTML.join('');
}

// Buy listing
async function buyListing(listingId) {
    showLoading(true);
    
    try {
        const response = await fetch('/api/buy-listing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listingId,
                account: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Tokens purchased successfully! Total: ${data.totalPrice} ETH`, 'success');
            await loadAccounts();
            await loadListings();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to buy tokens', 'error');
    } finally {
        showLoading(false);
    }
}

// Cancel listing
async function cancelListing(listingId) {
    showLoading(true);
    
    try {
        const response = await fetch('/api/cancel-listing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listingId,
                account: currentAccount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Listing cancelled successfully!', 'success');
            await loadListings();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast('Failed to cancel listing', 'error');
    } finally {
        showLoading(false);
    }
}

// Load assets for analytics
async function loadAssetsForAnalytics() {
    try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('analyticsAssetSelect');
            select.innerHTML = '<option value="">Select an asset...</option>';
            
            data.assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset.id;
                option.textContent = asset.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        showToast('Failed to load assets', 'error');
    }
}

// Load analytics
async function loadAnalytics() {
    const assetId = document.getElementById('analyticsAssetSelect').value;
    
    if (!assetId) {
        showToast('Please select an asset', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        // Get asset details
        const assetResponse = await fetch(`/api/asset/${assetId}`);
        const assetData = await assetResponse.json();
        
        // Get top beneficiaries
        const beneficiariesResponse = await fetch(`/api/top-beneficiaries/${assetId}?limit=10`);
        const beneficiariesData = await beneficiariesResponse.json();
        
        // Get all owners
        const ownersResponse = await fetch(`/api/asset-owners/${assetId}`);
        const ownersData = await ownersResponse.json();
        
        if (assetData.success && beneficiariesData.success && ownersData.success) {
            document.getElementById('totalOwners').textContent = ownersData.owners.length;
            document.getElementById('analyticsTokens').textContent = assetData.asset.totalTokens;
            
            displayBeneficiaries(beneficiariesData.beneficiaries);
            displayOwners(ownersData.owners);
            
            document.getElementById('analyticsResults').style.display = 'block';
        }
    } catch (error) {
        showToast('Failed to load analytics', 'error');
    } finally {
        showLoading(false);
    }
}

// Display beneficiaries
function displayBeneficiaries(beneficiaries) {
    const container = document.getElementById('topBeneficiaries');
    
    if (beneficiaries.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No beneficiaries found</p></div>';
        return;
    }
    
    container.innerHTML = beneficiaries.map((beneficiary, index) => `
        <div class="beneficiary-card">
            <div class="beneficiary-rank">${index + 1}</div>
            <div class="beneficiary-info">
                <div class="beneficiary-address">${beneficiary.address}</div>
            </div>
            <div class="beneficiary-tokens">${beneficiary.tokens} tokens</div>
        </div>
    `).join('');
}

// Display owners
function displayOwners(owners) {
    const container = document.getElementById('allOwners');
    
    if (owners.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No owners found</p></div>';
        return;
    }
    
    container.innerHTML = owners.map(owner => `
        <div class="owner-card">
            <div class="beneficiary-info">
                <div class="beneficiary-address">${owner.address}</div>
            </div>
            <div class="beneficiary-tokens">${owner.tokens} tokens</div>
        </div>
    `).join('');
}

// Load top assets chart
async function loadTopAssetsChart() {
    try {
        const response = await fetch('/api/top-assets');
        const data = await response.json();
        
        if (data.success) {
            displayTopAssetsChart(data.assets);
        }
    } catch (error) {
        console.error('Failed to load top assets');
    }
}

// Display top assets as bar chart
function displayTopAssetsChart(assets) {
    const container = document.getElementById('topAssetsChart');
    
    if (assets.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No assets found. Create and distribute assets to see data.</p></div>';
        return;
    }
    
    const maxDistributed = Math.max(...assets.map(a => a.distributedTokens));
    const minDistributed = Math.min(...assets.filter(a => a.distributedTokens > 0).map(a => a.distributedTokens));
    
    // Use logarithmic scale if there's a large range
    const useLogScale = maxDistributed / (minDistributed || 1) > 100;
    
    container.innerHTML = assets.map((asset, index) => {
        let percentage;
        
        if (asset.distributedTokens === 0) {
            percentage = 5;
        } else if (useLogScale) {
            const logMax = Math.log10(maxDistributed);
            const logMin = Math.log10(minDistributed);
            const logValue = Math.log10(asset.distributedTokens);
            percentage = ((logValue - logMin) / (logMax - logMin)) * 80 + 20;
        } else {
            percentage = Math.max((asset.distributedTokens / maxDistributed) * 100, 20);
        }
        
        const showLabelInside = percentage > 30;
        const distributionRate = asset.totalTokens > 0 
            ? ((asset.distributedTokens / asset.totalTokens) * 100).toFixed(1) 
            : 0;
        
        return `
            <div class="chart-bar-container-asset">
                <div class="chart-rank">${index + 1}</div>
                <div class="asset-info-chart">
                    <div class="asset-name-chart">${asset.name}</div>
                    <div class="asset-location-chart">📍 ${asset.location}</div>
                </div>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="width: ${percentage}%">
                        ${showLabelInside ? `<span class="chart-bar-label">${asset.distributedTokens.toLocaleString()} tokens (${distributionRate}%)</span>` : ''}
                    </div>
                    ${!showLabelInside ? `<span class="chart-bar-label-outside">${asset.distributedTokens.toLocaleString()} tokens (${distributionRate}%)</span>` : ''}
                </div>
                <div class="asset-stats-chart">
                    <span class="stat-badge">${asset.ownerCount} owners</span>
                </div>
            </div>
        `;
    }).join('');
}

// Load top holders across all assets as chart
async function loadTopHoldersChart() {
    try {
        const response = await fetch('/api/top-holders-all');
        const data = await response.json();
        
        if (data.success) {
            displayTopHoldersChart(data.holders);
        }
    } catch (error) {
        console.error('Failed to load top holders');
    }
}

// Display top holders as bar chart
function displayTopHoldersChart(holders) {
    const container = document.getElementById('topHoldersChart');
    
    if (holders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No token holders found. Create assets and purchase tokens to see data.</p></div>';
        return;
    }
    
    const maxTokens = Math.max(...holders.map(h => h.tokens));
    const minTokens = Math.min(...holders.map(h => h.tokens));
    
    // Use logarithmic scale for better visualization of large differences
    const logMax = Math.log10(maxTokens);
    const logMin = Math.log10(minTokens);
    
    container.innerHTML = holders.map((holder, index) => {
        // Calculate percentage using log scale, then map to 20-100% range
        const logValue = Math.log10(holder.tokens);
        const logPercentage = ((logValue - logMin) / (logMax - logMin)) * 80 + 20;
        const percentage = Math.max(logPercentage, 20);
        
        const showLabelInside = percentage > 30;
        
        // Sort assets by token count and get top 3
        const assetEntries = Object.entries(holder.assets).map(([id, data]) => ({
            id,
            name: data.name,
            tokens: data.tokens
        })).sort((a, b) => b.tokens - a.tokens);
        
        const top3Assets = assetEntries.slice(0, 3);
        const otherAssets = assetEntries.slice(3);
        const otherTotal = otherAssets.reduce((sum, asset) => sum + asset.tokens, 0);
        
        const assetBreakdownHTML = `
            <div class="asset-breakdown" id="breakdown-${index}" style="display: none;">
                ${top3Assets.map(asset => `
                    <div class="breakdown-item">
                        <span class="breakdown-asset-name">${asset.name}</span>
                        <span class="breakdown-tokens">${asset.tokens} tokens</span>
                    </div>
                `).join('')}
                ${otherTotal > 0 ? `
                    <div class="breakdown-item">
                        <span class="breakdown-asset-name">Other (${otherAssets.length} assets)</span>
                        <span class="breakdown-tokens">${otherTotal} tokens</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        return `
            <div class="chart-bar-container" onclick="toggleBreakdown(${index})">
                <div class="chart-rank">${index + 1}</div>
                <div class="chart-address">${holder.address.substring(0, 10)}...${holder.address.substring(holder.address.length - 8)}</div>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="width: ${percentage}%">
                        ${showLabelInside ? `<span class="chart-bar-label">${holder.tokens.toLocaleString()} tokens</span>` : ''}
                    </div>
                    ${!showLabelInside ? `<span class="chart-bar-label-outside">${holder.tokens.toLocaleString()} tokens</span>` : ''}
                </div>
            </div>
            ${assetBreakdownHTML}
        `;
    }).join('');
}

// Toggle asset breakdown
function toggleBreakdown(index) {
    const breakdown = document.getElementById(`breakdown-${index}`);
    const isVisible = breakdown.style.display === 'block';
    
    // Hide all other breakdowns
    document.querySelectorAll('.asset-breakdown').forEach(el => {
        el.style.display = 'none';
    });
    
    // Toggle current breakdown
    breakdown.style.display = isVisible ? 'none' : 'block';
}

// Load top holders across all assets
async function loadTopHolders() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/top-holders-all');
        const data = await response.json();
        
        if (data.success) {
            displayTopHolders(data.holders);
            document.getElementById('topHoldersResults').style.display = 'block';
        }
    } catch (error) {
        showToast('Failed to load top holders', 'error');
    } finally {
        showLoading(false);
    }
}

// Display top holders
function displayTopHolders(holders) {
    const container = document.getElementById('topHoldersList');
    
    if (holders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No holders found</p></div>';
        return;
    }
    
    container.innerHTML = holders.map((holder, index) => `
        <div class="beneficiary-card">
            <div class="beneficiary-rank">${index + 1}</div>
            <div class="beneficiary-info">
                <div class="beneficiary-address">${holder.address}</div>
            </div>
            <div class="beneficiary-tokens">${holder.tokens} tokens</div>
        </div>
    `).join('');
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
