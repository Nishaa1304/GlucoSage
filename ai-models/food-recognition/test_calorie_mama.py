"""
Test Calorie Mama API Integration
Tests food detection on sample images
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

from calorie_mama_api import CalorieMamaDetector

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*60)
    print(f"🍽️  {title}")
    print("="*60 + "\n")

def print_detection(detection, index):
    """Print formatted detection result"""
    print(f"{index}. {detection['item'].upper().replace('_', ' ')}")
    print(f"   Confidence: {detection['confidence']*100:.1f}%")
    if 'nutrition' in detection:
        nutrition = detection['nutrition']
        print(f"   Nutrition:")
        print(f"     • Calories: {nutrition.get('calories', 0):.0f} kcal")
        print(f"     • Carbs: {nutrition.get('carbohydrates', 0):.1f}g")
        print(f"     • Protein: {nutrition.get('protein', 0):.1f}g")
        print(f"     • Fat: {nutrition.get('fat', 0):.1f}g")
    print(f"   Portion: {detection.get('portion_size', 'medium')}")
    print(f"   Weight: {detection.get('estimated_weight', 0):.1f}g\n")

def test_api_key():
    """Test if API key is configured"""
    print_section("CHECKING API KEY")
    
    api_key = os.getenv('CALORIE_MAMA_API_KEY')
    
    if not api_key or api_key.strip() == '':
        print("❌ CALORIE_MAMA_API_KEY not found in .env file")
        print("\n📋 Setup Instructions:")
        print("1. Go to: https://rapidapi.com/spoonacular/api/calorie-mama")
        print("2. Sign up and subscribe to FREE plan (500 requests/month)")
        print("3. Copy your API key")
        print("4. Add to ai-models/.env file:")
        print("   CALORIE_MAMA_API_KEY=your_api_key_here")
        print("\n📖 See CALORIE_MAMA_SETUP.md for detailed instructions")
        return None
    
    print("✅ API key found")
    print(f"🔑 Key: {api_key[:20]}...{api_key[-10:]}")
    return api_key

def test_detector_init(api_key):
    """Test detector initialization"""
    print_section("INITIALIZING DETECTOR")
    
    try:
        detector = CalorieMamaDetector(api_key)
        print("✅ CalorieMamaDetector initialized successfully")
        return detector
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        return None

def test_image_detection(detector, image_path, description):
    """Test detection on a single image"""
    print_section(f"TESTING: {description}")
    
    if not os.path.exists(image_path):
        print(f"⚠️  Image not found: {image_path}")
        return
    
    print(f"📸 Image: {image_path}")
    
    try:
        result = detector.detect_food(image_path)
        
        if result['success']:
            print(f"✅ Detected {result['total_items']} food items:\n")
            
            for i, detection in enumerate(result['detections'], 1):
                print_detection(detection, i)
            
            # Print summary
            if result['detections']:
                total_calories = sum(d.get('nutrition', {}).get('calories', 0) 
                                   for d in result['detections'])
                total_carbs = sum(d.get('nutrition', {}).get('carbohydrates', 0) 
                                for d in result['detections'])
                
                print(f"\n📊 MEAL SUMMARY:")
                print(f"   Total Calories: {total_calories:.0f} kcal")
                print(f"   Total Carbs: {total_carbs:.1f}g")
                print(f"   Items Count: {result['total_items']}")
        else:
            print(f"❌ Detection failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error during detection: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("\n" + "="*60)
    print("🧪 CALORIE MAMA API TEST SUITE")
    print("="*60)
    
    # Step 1: Check API key
    api_key = test_api_key()
    if not api_key:
        return
    
    # Step 2: Initialize detector
    detector = test_detector_init(api_key)
    if not detector:
        return
    
    # Step 3: Test with sample images
    test_images = [
        ("../dataset/raw-images/biryani/biryani_1.jpg", "Biryani Image"),
        ("../dataset/raw-images/idli/idli_1.jpg", "Idli Image"),
        ("../dataset/raw-images/thali/thali_1.jpg", "Thali (Multiple Items)"),
        ("../dataset/raw-images/dosa/dosa_1.jpg", "Dosa Image"),
    ]
    
    for image_path, description in test_images:
        full_path = Path(__file__).parent / image_path
        test_image_detection(detector, str(full_path), description)
    
    # Final summary
    print_section("TEST COMPLETE")
    print("✅ All tests completed!")
    print("\n📖 Next Steps:")
    print("1. If tests passed, Calorie Mama is ready to use")
    print("2. Start API server: python api_server.py")
    print("3. Use endpoint: POST /api/v1/food/detect/caloriemama")
    print("4. See CALORIE_MAMA_SETUP.md for usage examples")

if __name__ == "__main__":
    main()
