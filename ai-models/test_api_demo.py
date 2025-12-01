"""
Test demo image upload to API
"""
import requests
from pathlib import Path

# Test with a demo image
demo_image = Path(__file__).parent / "demo-images" / "chicken-biryani.jpg"

if not demo_image.exists():
    print(f"❌ Demo image not found: {demo_image}")
    exit(1)

print(f"📤 Testing API with: {demo_image.name}")
print()

# Test health endpoint first
print("1️⃣ Testing health endpoint...")
try:
    response = requests.get('http://localhost:5001/health', timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
except Exception as e:
    print(f"   ❌ Error: {e}")
    print()

# Test demo detection endpoint
print("2️⃣ Testing demo detection endpoint...")
try:
    with open(demo_image, 'rb') as f:
        files = {'file': (demo_image.name, f, 'image/jpeg')}
        response = requests.post(
            'http://localhost:5001/api/v1/food/detect/demo',
            files=files,
            timeout=30
        )
    
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Success: {result.get('success')}")
    
    if result.get('success'):
        detections = result.get('detections', [])
        print(f"   Detections: {len(detections)} item(s)")
        for det in detections:
            print(f"      - {det.get('display_name')} ({det.get('confidence')*100:.0f}% confidence)")
            print(f"        Calories: {det.get('nutrition', {}).get('calories')} kcal")
    else:
        print(f"   Error: {result.get('error')}")
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
