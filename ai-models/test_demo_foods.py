"""Test detection on multiple sample images to see what works best"""
import requests
import os
import json
from pathlib import Path

# Find all test images
test_images_dir = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\test\images"
train_images_dir = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\train\images"

print("🧪 TESTING FOOD DETECTION ACCURACY")
print("=" * 60)

# Get sample images (first 3 from test set)
test_images = list(Path(test_images_dir).glob("*.jpg"))[:5]

if not test_images:
    print("No test images found, using training images...")
    test_images = list(Path(train_images_dir).glob("*.jpg"))[:5]

results = []

for img_path in test_images:
    print(f"\n📸 Testing: {img_path.name}")
    
    try:
        with open(img_path, 'rb') as img:
            files = {'file': (img_path.name, img, 'image/jpeg')}
            response = requests.post('http://localhost:5001/api/v1/food/detect', files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('detections'):
                detections = data['detections']
                print(f"   ✅ Detected {len(detections)} items:")
                for det in detections:
                    item = det.get('item', 'unknown').replace('_', ' ').title()
                    conf = det.get('confidence', 0) * 100
                    method = det.get('method', 'unknown')
                    print(f"      • {item} ({conf:.1f}%) - {method}")
                    
                    results.append({
                        'image': img_path.name,
                        'item': item,
                        'confidence': conf,
                        'method': method
                    })
            else:
                print(f"   ⚠️  No detections")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

# Summary
print("\n" + "=" * 60)
print("📊 SUMMARY - RECOMMENDED FOODS FOR DEMO")
print("=" * 60)

# Group by item
from collections import defaultdict
by_item = defaultdict(list)
for r in results:
    by_item[r['item']].append(r['confidence'])

# Sort by average confidence
sorted_items = sorted(by_item.items(), key=lambda x: sum(x[1])/len(x[1]), reverse=True)

print("\n✅ HIGH CONFIDENCE (>60%) - USE THESE:")
high_conf = [(item, confs) for item, confs in sorted_items if sum(confs)/len(confs) > 60]
for item, confs in high_conf:
    avg_conf = sum(confs) / len(confs)
    print(f"   • {item}: {avg_conf:.1f}% (detected {len(confs)} times)")

print("\n⚠️  MEDIUM CONFIDENCE (40-60%) - MAY WORK:")
med_conf = [(item, confs) for item, confs in sorted_items if 40 <= sum(confs)/len(confs) <= 60]
for item, confs in med_conf:
    avg_conf = sum(confs) / len(confs)
    print(f"   • {item}: {avg_conf:.1f}% (detected {len(confs)} times)")

print("\n❌ LOW CONFIDENCE (<40%) - AVOID:")
low_conf = [(item, confs) for item, confs in sorted_items if sum(confs)/len(confs) < 40]
for item, confs in low_conf:
    avg_conf = sum(confs) / len(confs)
    print(f"   • {item}: {avg_conf:.1f}% (detected {len(confs)} times)")

print("\n" + "=" * 60)
