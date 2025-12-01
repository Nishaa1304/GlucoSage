"""Test demo mode with real images"""
import requests

images = [
    'chicken-biryani.jpg',
    'idli-sambar-6pc.jpg',
    'veg-thali-1.jpg',
    'veg-thali-2.jpg',
    'north-indian-thali.jpg'
]

print("🧪 TESTING DEMO MODE - ALL 5 IMAGES")
print("=" * 70)

for img_name in images:
    img_path = f"demo-images/{img_name}"
    
    print(f"\n📸 Testing: {img_name}")
    
    try:
        with open(img_path, 'rb') as img:
            files = {'file': (img_name, img, 'image/jpeg')}
            response = requests.post('http://localhost:5001/api/v1/food/detect/demo', files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                det = data['detections'][0]
                pred = data.get('glucose_prediction', {})
                
                print(f"   ✅ SUCCESS!")
                print(f"   Food: {det['display_name']}")
                print(f"   Confidence: {det['confidence']*100:.1f}%")
                print(f"   Calories: {det['nutrition']['calories']} kcal")
                print(f"   Carbs: {det['nutrition']['carbohydrates']}g")
                print(f"   Glycemic Load: {det['glycemic_load']}")
                print(f"   Glucose Spike: +{pred['peak_increase_mg_dl']} mg/dL in {pred['peak_time_minutes']} mins")
                print(f"   Advice: {pred['advice'][:60]}...")
            else:
                print(f"   ❌ {data.get('error')}")
        else:
            print(f"   ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

print("\n" + "=" * 70)
print("✅ ALL TESTS COMPLETE!")
print("\n💡 Frontend is already configured to use /demo endpoint")
print("🚀 Just start frontend and upload these images for perfect results!")
print("=" * 70)
