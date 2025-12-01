"""Test idli-sambar detection"""
import sys
from pathlib import Path
import importlib.util
import json

# Add paths
sys.path.append(str(Path(__file__).parent))

# Import FoodDetectionService
food_rec_spec = importlib.util.spec_from_file_location(
    "food_detection_service", 
    Path(__file__).parent / "food-recognition" / "food_detection_service.py"
)
food_rec_module = importlib.util.module_from_spec(food_rec_spec)
food_rec_spec.loader.exec_module(food_rec_module)
FoodDetectionService = food_rec_module.FoodDetectionService

# Initialize service with fallback enabled
service = FoodDetectionService(
    'models/food-recognition/indian-food-v14/weights/best.pt',
    'food-recognition/nutrition_database.json',
    use_fallback=True
)

# Test with a sample from your dataset
# Update this path if you have the idli-sambar image saved elsewhere
test_image = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\test\images\00000041_resized_png.rf.a1e50a5bd9b105f2822cfc7cfacd23cf.jpg"

print("\n" + "="*60)
print("🍽️  TESTING IDLI-SAMBAR DETECTION")
print("="*60 + "\n")

try:
    # Run detection with lower confidence to catch more items
    results = service.detect_foods(test_image, conf_threshold=0.20)
    
    print(f"✅ Detected {len(results)} food items:\n")
    
    for i, item in enumerate(results, 1):
        print(f"{i}. {item['item'].upper()}")
        print(f"   Confidence: {item['confidence']*100:.1f}%")
        if 'detection_method' in item:
            print(f"   Method: {item['detection_method']}")
        if 'portion_size' in item:
            print(f"   Portion: {item['portion_size']}")
        if 'estimated_weight' in item:
            print(f"   Weight: {item['estimated_weight']}g")
        print()
    
    # Print full JSON
    print("\n" + "="*60)
    print("FULL DETECTION RESULTS:")
    print("="*60)
    print(json.dumps(results, indent=2))
    
except FileNotFoundError:
    print("❌ Image not found!")
    print(f"   Please save the idli image to: {test_image}")
    print("\n💡 You can use any test image from your dataset:")
    print("   Or provide the correct path to your idli-sambar image")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
