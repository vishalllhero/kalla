import requests

# Login as buyer
resp = requests.post('http://127.0.0.1:8000/api/v1/auth/login', json={'email': 'buyer1@kalaamarket.com', 'password': 'Buyer@123'})
print('Login:', resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    token = data['access_token']
    user = data['user']
    print('User:', user['email'], 'role:', user['role'])
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get listed artworks
    resp2 = requests.get('http://127.0.0.1:8000/api/v1/artworks?is_listed=true&status=listed', headers=headers)
    print('Artworks:', resp2.status_code, len(resp2.json()) if resp2.status_code == 200 else 'N/A')
    
    if resp2.status_code == 200 and resp2.json():
        artwork = resp2.json()[0]
        print('Artwork:', artwork['artwork_id'], '-', artwork['title'], 'Price:', artwork['price'])
        
        # Test checkout preview
        resp3 = requests.get('http://127.0.0.1:8000/api/v1/orders/checkout/preview?artwork_id=1', headers=headers)
        print('Preview:', resp3.status_code)
        if resp3.status_code == 200:
            preview = resp3.json()
            print('  Sale price:', preview['total_amount'])
            print('  Platform fee:', preview['platform_fee'])
            print('  Artisan payout:', preview['artisan_payout'])
            print('  Total:', preview['total_amount'])
            print('  Blockchain status:', preview['blockchain_status'])
            print('  Demo mode:', preview['is_demo_mode'])
        else:
            print('  Error:', resp3.text)