from flask import Flask, render_template, request, jsonify
from web3 import Web3
import json
import os

app = Flask(__name__)

# Connect to Ganache
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

# Contract details
contract_address = None
contract_abi = None
contract = None

def load_contract():
    global contract_address, contract_abi, contract
    
    contract_path = os.path.join(os.path.dirname(__file__), 'contracts', 'RealEstateToken.sol')
    
    with open('contract_config.json', 'r') as f:
        config = json.load(f)
        contract_address = config['address']
        contract_abi = config['abi']
    
    contract = web3.eth.contract(address=contract_address, abi=contract_abi)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    try:
        accounts = web3.eth.accounts
        balances = []
        for account in accounts:
            balance = web3.eth.get_balance(account)
            balances.append({
                'address': account,
                'balance': web3.from_wei(balance, 'ether')
            })
        return jsonify({'success': True, 'accounts': balances})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/create-asset', methods=['POST'])
def create_asset():
    try:
        data = request.json
        name = data['name']
        location = data['location']
        total_value = web3.to_wei(data['totalValue'], 'ether')
        total_tokens = int(data['totalTokens'])
        account = data['account']
        
        tx_hash = contract.functions.createAsset(
            name,
            location,
            total_value,
            total_tokens
        ).transact({'from': account})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        asset_count = contract.functions.getTotalAssets().call()
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex(),
            'assetId': asset_count
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/assets', methods=['GET'])
def get_assets():
    try:
        asset_count = contract.functions.getTotalAssets().call()
        assets = []
        
        for i in range(1, asset_count + 1):
            asset_data = contract.functions.getAsset(i).call()
            assets.append({
                'id': asset_data[0],
                'name': asset_data[1],
                'location': asset_data[2],
                'totalValue': web3.from_wei(asset_data[3], 'ether'),
                'totalTokens': asset_data[4],
                'tokenPrice': web3.from_wei(asset_data[5], 'ether'),
                'issuer': asset_data[6],
                'createdAt': asset_data[7]
            })
        
        return jsonify({'success': True, 'assets': assets})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/asset/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    try:
        asset_data = contract.functions.getAsset(asset_id).call()
        asset = {
            'id': asset_data[0],
            'name': asset_data[1],
            'location': asset_data[2],
            'totalValue': web3.from_wei(asset_data[3], 'ether'),
            'totalTokens': asset_data[4],
            'tokenPrice': web3.from_wei(asset_data[5], 'ether'),
            'issuer': asset_data[6],
            'createdAt': asset_data[7]
        }
        return jsonify({'success': True, 'asset': asset})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/purchase', methods=['POST'])
def purchase_tokens():
    try:
        data = request.json
        asset_id = int(data['assetId'])
        amount = int(data['amount'])
        account = data['account']
        
        asset_data = contract.functions.getAsset(asset_id).call()
        token_price = asset_data[5]
        total_cost = token_price * amount
        
        tx_hash = contract.functions.purchaseTokens(
            asset_id,
            amount
        ).transact({'from': account, 'value': total_cost})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex(),
            'totalCost': web3.from_wei(total_cost, 'ether')
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/transfer', methods=['POST'])
def transfer_tokens():
    try:
        data = request.json
        asset_id = int(data['assetId'])
        to_address = data['toAddress']
        amount = int(data['amount'])
        from_address = data['fromAddress']
        
        tx_hash = contract.functions.transferTokens(
            asset_id,
            to_address,
            amount
        ).transact({'from': from_address})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex()
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/list-tokens', methods=['POST'])
def list_tokens():
    try:
        data = request.json
        asset_id = int(data['assetId'])
        amount = int(data['amount'])
        price_per_token = web3.to_wei(data['pricePerToken'], 'ether')
        account = data['account']
        
        tx_hash = contract.functions.listTokensForSale(
            asset_id,
            amount,
            price_per_token
        ).transact({'from': account})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex()
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/listings', methods=['GET'])
def get_listings():
    try:
        listings_data = contract.functions.getAllListings().call()
        listings = []
        
        for i in range(len(listings_data[0])):
            listings.append({
                'listingId': listings_data[0][i],
                'seller': listings_data[1][i],
                'assetId': listings_data[2][i],
                'tokenAmount': listings_data[3][i],
                'pricePerToken': web3.from_wei(listings_data[4][i], 'ether'),
                'active': listings_data[5][i]
            })
        
        return jsonify({'success': True, 'listings': listings})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/buy-listing', methods=['POST'])
def buy_listing():
    try:
        data = request.json
        listing_id = int(data['listingId'])
        account = data['account']
        
        listing = contract.functions.listings(listing_id).call()
        total_price = listing[2] * listing[3]
        
        tx_hash = contract.functions.buyListedTokens(
            listing_id
        ).transact({'from': account, 'value': total_price})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex(),
            'totalPrice': web3.from_wei(total_price, 'ether')
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/cancel-listing', methods=['POST'])
def cancel_listing():
    try:
        data = request.json
        listing_id = int(data['listingId'])
        account = data['account']
        
        tx_hash = contract.functions.cancelListing(
            listing_id
        ).transact({'from': account})
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            'success': True,
            'transactionHash': tx_hash.hex()
        })
    except Exception as e:
        error_msg = str(e)
        if 'revert' in error_msg:
            error_msg = error_msg.split('revert')[-1].strip()
        return jsonify({'success': False, 'error': error_msg})

@app.route('/api/balance/<int:asset_id>/<address>', methods=['GET'])
def get_balance(asset_id, address):
    try:
        balance = contract.functions.getBalance(asset_id, address).call()
        return jsonify({'success': True, 'balance': balance})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/top-beneficiaries/<int:asset_id>', methods=['GET'])
def get_top_beneficiaries(asset_id):
    try:
        limit = request.args.get('limit', 10, type=int)
        result = contract.functions.getTopBeneficiaries(asset_id, limit).call()
        
        beneficiaries = []
        for i in range(len(result[0])):
            beneficiaries.append({
                'address': result[0][i],
                'tokens': result[1][i]
            })
        
        return jsonify({'success': True, 'beneficiaries': beneficiaries})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/asset-owners/<int:asset_id>', methods=['GET'])
def get_asset_owners(asset_id):
    try:
        owners = contract.functions.getAssetOwners(asset_id).call()
        owner_data = []
        
        for owner in owners:
            balance = contract.functions.getBalance(asset_id, owner).call()
            owner_data.append({
                'address': owner,
                'tokens': balance
            })
        
        return jsonify({'success': True, 'owners': owner_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/top-holders-all', methods=['GET'])
def get_top_holders_all():
    try:
        asset_count = contract.functions.getTotalAssets().call()
        holder_totals = {}
        
        for asset_id in range(1, asset_count + 1):
            owners = contract.functions.getAssetOwners(asset_id).call()
            for owner in owners:
                balance = contract.functions.getBalance(asset_id, owner).call()
                holder_totals[owner] = holder_totals.get(owner, 0) + balance
        
        sorted_holders = sorted(holder_totals.items(), key=lambda x: x[1], reverse=True)[:10]
        holders = [{'address': addr, 'tokens': tokens} for addr, tokens in sorted_holders]
        
        return jsonify({'success': True, 'holders': holders})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    if os.path.exists('contract_config.json'):
        load_contract()
    app.run(debug=True, port=5000)
