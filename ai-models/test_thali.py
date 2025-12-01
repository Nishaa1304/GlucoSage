"""Test food detection on thali image"""
import sys
from pathlib import Path

# Add paths
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent / "food-recognition"))

# Import using full path
import importlib.util
food_rec_spec = importlib.util.spec_from_file_location(
    "food_detection_service", 
    Path(__file__).parent / "food-recognition" / "food_detection_service.py"
)
food_rec_module = importlib.util.module_from_spec(food_rec_spec)
food_rec_spec.loader.exec_module(food_rec_module)
FoodDetectionService = food_rec_module.FoodDetectionService

import json

# Initialize service with fallback enabled
service = FoodDetectionService(
    'models/food-recognition/indian-food-v14/weights/best.pt',
    'food-recognition/nutrition_database.json',
    use_fallback=True  # Enable generic food detection
)

# Test image path - using validation image
test_image = r"D:\Yukti\glucosage\ai-models\dataset\roboflow-export\valid\images\00000054_resized_png.rf.df46056d6e2bec6caefe75e64a74d14c.jpg"

print("\n" + "="*60)
print("🍽️  TESTING FOOD DETECTION ON THALI IMAGE")
print("="*60 + "\n")

try:
    # Run detection
    results = service.detect_foods(test_image, conf_threshold=0.25)
    
    print(f"✅ Detected {len(results)} food items:\n")
    
    for i, item in enumerate(results, 1):
        print(f"{i}. {item['item'].upper()}")
        print(f"   Confidence: {item['confidence']*100:.1f}%")
        if 'portion' in item:
            print(f"   Portion: {item['portion'].get('size', 'N/A')}")
        if 'nutrition' in item:
            print(f"   Carbs: {item['nutrition']['carbs']}g")
            print(f"   Calories: {item['nutrition']['calories']}")
        print()
    
    # Print full JSON for debugging
    print("\n" + "="*60)
    print("FULL DETECTION RESULTS:")
    print("="*60)
    print(json.dumps(results, indent=2))
    
except FileNotFoundError:
    print("❌ Image not found. Please save the thali image to:")
    print(f"   {test_image}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
