"""Test local model with multipart file upload"""
import requests

image_path = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\train\images\00000037_resized_png.rf.45273159ca714a7953ca21988402e7b2.jpg"

print("🧪 Testing LOCAL YOLOv8 model...")
print(f"📸 Image: {image_path}\n")

try:
    with open(image_path, 'rb') as img:
        files = {'file': ('food.jpg', img, 'image/jpeg')}
        response = requests.post('http://localhost:5001/api/v1/food/detect', files=files, timeout=60)
    
    print(f"✅ Status Code: {response.status_code}")
    
    if response.status_code == 200:
        import json
        data = response.json()
        print(f"\n🎯 Detection Results:")
        print(f"   Success: {data.get('success')}")
        print(f"   Number of items: {data.get('num_foods', 0)}")
        
        if data.get('detections'):
            print(f"\n📋 Detected Items:")
            for i, det in enumerate(data['detections'], 1):
                print(f"\n   {i}. {det.get('item', 'unknown').upper()}")
                print(f"      Confidence: {det.get('confidence', 0):.2%}")
                print(f"      Method: {det.get('method', 'unknown')}")
                if det.get('nutrition'):
                    n = det['nutrition']
                    print(f"      Calories: {n.get('calories', 0)} kcal")
                    print(f"      Carbs: {n.get('carbohydrates', 0)}g")
        else:
            print("\n⚠️  No food items detected in image")
    else:
        print(f"\n❌ Error Response:")
        print(response.text)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
