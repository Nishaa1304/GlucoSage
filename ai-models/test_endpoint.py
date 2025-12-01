"""Quick test to verify Spoonacular endpoint works with image upload"""
import requests

# Test image path
image_path = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\train\images\00000037_resized_png.rf.45273159ca714a7953ca21988402e7b2.jpg"

print("🧪 Testing Spoonacular API endpoint...")
print(f"📸 Image: {image_path}")

try:
    with open(image_path, 'rb') as img:
        files = {'file': ('food.jpg', img, 'image/jpeg')}
        response = requests.post('http://localhost:5001/api/v1/food/detect/spoonacular', files=files, timeout=30)
    
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"📦 Response:")
    import json
    print(json.dumps(response.json(), indent=2))
    
except Exception as e:
    print(f"❌ Error: {e}")
