#!/usr/bin/env python3
"""
Quick Test: Food Detection Service
Tests the pre-trained model with sample images
"""

from pathlib import Path
import sys
import os

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))
os.chdir(str(parent_dir))

from food_recognition.food_detection_service import FoodDetectionService
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

def download_test_image(url: str, save_path: str):
    """Download a test image"""
    print(f"📥 Downloading test image...")
    response = requests.get(url)
    with open(save_path, 'wb') as f:
        f.write(response.content)
    print(f"✅ Saved to: {save_path}")

def test_detection():
    """Test food detection with sample image"""
    
    print("=" * 60)
    print("🧪 Testing Food Detection Service")
    print("=" * 60)
    print()
    
    # Paths
    base_path = Path(__file__).parent.parent
    model_path = base_path / 'yolov8n.pt'
    nutrition_db_path = base_path / 'food-recognition' / 'nutrition_database.json'
    test_image_path = base_path / 'test_food_image.jpg'
    
    # Download a test food image if not exists
    if not test_image_path.exists():
        print("📥 Downloading sample food image...")
        # Indian food thali image
        test_url = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"
        try:
            download_test_image(test_url, str(test_image_path))
        except:
            print("⚠️  Download failed, please add a food image manually to:")
            print(f"   {test_image_path}")
            print()
            print("💡 For now, testing with dummy detection...")
            return test_mock_detection()
    
    # Initialize service
    print("🔧 Initializing detection service...")
    try:
        service = FoodDetectionService(
            model_path=str(model_path),
            nutrition_db_path=str(nutrition_db_path)
        )
        print()
        
        # Run detection
        print("🔍 Running food detection...")
        results = service.detect_foods(
            image_path=str(test_image_path),
            conf_threshold=0.25
        )
        
        print()
        print("=" * 60)
        print("📊 Detection Results")
        print("=" * 60)
        
        if results:
            print(f"\n✅ Detected {len(results)} food items:\n")
            
            for i, detection in enumerate(results, 1):
                print(f"{i}. {detection['item'].upper()}")
                print(f"   Confidence: {detection['confidence']:.1%}")
                print(f"   Portion: {detection['portion_size']}")
                
                if 'nutrition' in detection:
                    nutrition = detection['nutrition']
                    print(f"   Nutrition:")
                    print(f"     • Carbs: {nutrition.get('carbs', 0)}g")
                    print(f"     • Protein: {nutrition.get('protein', 0)}g")
                    print(f"     • Calories: {nutrition.get('calories', 0)} kcal")
                    print(f"     • GI: {nutrition.get('glycemic_index', 'N/A')}")
                
                print()
        else:
            print("\n⚠️  No food items detected")
            print("💡 Try with a clearer food image")
        
        print("=" * 60)
        print()
        print("✅ Test complete!")
        print()
        print("🎯 Next steps:")
        print("   1. Start API server: python api_server.py")
        print("   2. Test with frontend")
        print("   3. Add more test images")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("🔧 Troubleshooting:")
        print("   1. Check model file exists: yolov8n.pt")
        print("   2. Check nutrition_database.json exists")
        print("   3. Install dependencies: pip install ultralytics opencv-python pillow")
        return False

def test_mock_detection():
    """Test with mock data (for demo purposes)"""
    print()
    print("=" * 60)
    print("🎭 Mock Detection Test (Demo Mode)")
    print("=" * 60)
    print()
    
    mock_results = [
        {
            "item": "roti",
            "confidence": 0.89,
            "portion_size": "medium",
            "nutrition": {
                "carbs": 45,
                "protein": 6,
                "calories": 240,
                "glycemic_index": 62
            }
        },
        {
            "item": "dal",
            "confidence": 0.82,
            "portion_size": "medium",
            "nutrition": {
                "carbs": 30,
                "protein": 15,
                "calories": 180,
                "glycemic_index": 28
            }
        },
        {
            "item": "rice",
            "confidence": 0.91,
            "portion_size": "large",
            "nutrition": {
                "carbs": 90,
                "protein": 8,
                "calories": 400,
                "glycemic_index": 73
            }
        }
    ]
    
    print("✅ Mock detection results:\n")
    
    for i, detection in enumerate(mock_results, 1):
        print(f"{i}. {detection['item'].upper()}")
        print(f"   Confidence: {detection['confidence']:.1%}")
        print(f"   Portion: {detection['portion_size']}")
        print(f"   Carbs: {detection['nutrition']['carbs']}g")
        print(f"   Calories: {detection['nutrition']['calories']} kcal")
        print()
    
    print("=" * 60)
    print()
    print("✅ Mock test complete!")
    print("💡 This demonstrates the expected output format")
    
    return True

if __name__ == '__main__':
    try:
        test_detection()
    except KeyboardInterrupt:
        print("\n\n👋 Test cancelled")
        sys.exit(0)
