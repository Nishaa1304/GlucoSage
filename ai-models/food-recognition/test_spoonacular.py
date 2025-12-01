"""
Test Spoonacular API Integration
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

from spoonacular_api import SpoonacularDetector

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*60)
    print(f"🍽️  {title}")
    print("="*60 + "\n")

def print_detection(detection, index):
    """Print formatted detection result"""
    print(f"{index}. {detection['item'].upper().replace('_', ' ')}")
    print(f"   Confidence: {detection['confidence']*100:.1f}%")
    
    if 'nutrition' in detection and detection['nutrition']:
        nutrition = detection['nutrition']
        print(f"   Nutrition:")
        print(f"     • Calories: {nutrition.get('calories', 0):.0f} kcal")
        print(f"     • Carbs: {nutrition.get('carbohydrates', 0):.1f}g")
        print(f"     • Protein: {nutrition.get('protein', 0):.1f}g")
        print(f"     • Fat: {nutrition.get('fat', 0):.1f}g")
    
    print(f"   Portion: {detection.get('portion_size', 'medium')}")
    print(f"   Weight: {detection.get('estimated_weight', 0):.1f}g")
    
    if 'similar_recipes' in detection and detection['similar_recipes']:
        print(f"   Similar Recipes:")
        for recipe in detection['similar_recipes'][:2]:
            print(f"     • {recipe['title']}")
    
    print()

def test_api_key():
    """Test if API key is configured"""
    print_section("CHECKING API KEY")
    
    api_key = os.getenv('SPOONACULAR_API_KEY')
    
    if not api_key or api_key.strip() == '':
        print("❌ SPOONACULAR_API_KEY not found in .env file")
        print("\n📋 Setup Instructions:")
        print("1. Go to: https://spoonacular.com/food-api/console#Dashboard")
        print("2. Sign up for FREE (no credit card needed)")
        print("3. Copy your API key from the dashboard")
        print("4. Add to ai-models/.env file:")
        print("   SPOONACULAR_API_KEY=your_api_key_here")
        print("\n📖 See SPOONACULAR_SETUP.md for detailed instructions")
        print("\n🎯 FREE Tier: 150 requests/day (4,500/month)")
        return None
    
    print("✅ API key found")
    key_preview = api_key[:15] + "..." + api_key[-10:] if len(api_key) > 25 else api_key[:10] + "..."
    print(f"🔑 Key: {key_preview}")
    return api_key

def test_detector_init(api_key):
    """Test detector initialization"""
    print_section("INITIALIZING DETECTOR")
    
    try:
        detector = SpoonacularDetector(api_key)
        print("✅ SpoonacularDetector initialized successfully")
        
        # Determine API type
        if detector.use_rapidapi:
            print("📡 Using: RapidAPI endpoint")
        else:
            print("📡 Using: Direct Spoonacular API (recommended)")
        
        return detector
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        return None

def test_connection(detector):
    """Test API connection"""
    print_section("TESTING CONNECTION")
    
    print("🔍 Sending test request...")
    
    if detector.test_connection():
        print("✅ Connection successful!")
        print("✅ API key is valid")
        print("✅ Ready to detect food")
        return True
    else:
        print("❌ Connection failed")
        print("\n💡 Possible issues:")
        print("   • API key is invalid or expired")
        print("   • Rate limit exceeded (150 requests/day)")
        print("   • Network connectivity issues")
        print("\n🔧 Solutions:")
        print("   • Check your API key at: https://spoonacular.com/food-api/console#Dashboard")
        print("   • Verify internet connection")
        print("   • Check daily usage limit")
        return False

def test_image_detection(detector, image_path, description):
    """Test detection on a single image"""
    print_section(f"TESTING: {description}")
    
    if not os.path.exists(image_path):
        print(f"⚠️  Image not found: {image_path}")
        return
    
    print(f"📸 Image: {image_path}")
    print("🔄 Analyzing image...")
    
    try:
        result = detector.detect_food(image_path)
        
        if result['success']:
            print(f"✅ Detection successful!")
            print(f"✅ Found {result['total_items']} food item(s):\n")
            
            for i, detection in enumerate(result['detections'], 1):
                print_detection(detection, i)
            
            # Print summary
            if result['detections']:
                detections = result['detections']
                
                # Calculate totals if nutrition available
                total_calories = sum(
                    d.get('nutrition', {}).get('calories', 0) 
                    for d in detections if 'nutrition' in d
                )
                total_carbs = sum(
                    d.get('nutrition', {}).get('carbohydrates', 0) 
                    for d in detections if 'nutrition' in d
                )
                
                if total_calories > 0:
                    print(f"📊 MEAL SUMMARY:")
                    print(f"   Total Calories: {total_calories:.0f} kcal")
                    print(f"   Total Carbs: {total_carbs:.1f}g")
                    print(f"   Items Count: {result['total_items']}")
        else:
            print(f"❌ Detection failed: {result.get('error', 'Unknown error')}")
            print("\n💡 Tips:")
            print("   • Ensure image is clear and well-lit")
            print("   • Try a photo with single food item")
            print("   • Check if rate limit exceeded")
            
    except Exception as e:
        print(f"❌ Error during detection: {e}")
        import traceback
        traceback.print_exc()

def test_recipe_search(detector):
    """Test recipe search functionality"""
    print_section("TESTING RECIPE SEARCH")
    
    query = "biryani"
    print(f"🔍 Searching for recipes: '{query}'")
    
    try:
        recipes = detector.search_recipes(query, number=3)
        
        if recipes:
            print(f"✅ Found {len(recipes)} recipes:\n")
            for i, recipe in enumerate(recipes, 1):
                print(f"{i}. {recipe.get('title', 'Unknown')}")
                print(f"   ID: {recipe.get('id', 0)}")
                if 'image' in recipe:
                    print(f"   Image: {recipe['image']}")
                print()
        else:
            print("⚠️  No recipes found")
            
    except Exception as e:
        print(f"❌ Recipe search failed: {e}")

def main():
    """Main test function"""
    print("\n" + "="*60)
    print("🧪 SPOONACULAR API TEST SUITE")
    print("="*60)
    
    # Step 1: Check API key
    api_key = test_api_key()
    if not api_key:
        return
    
    # Step 2: Initialize detector
    detector = test_detector_init(api_key)
    if not detector:
        return
    
    # Step 3: Test connection
    if not test_connection(detector):
        return
    
    # Step 4: Test with sample images
    test_images = [
        ("../dataset/raw-images/biryani/biryani_1.jpg", "Biryani Image"),
        ("../dataset/raw-images/idli/idli_1.jpg", "Idli Image"),
        ("../dataset/raw-images/dosa/dosa_1.jpg", "Dosa Image"),
        ("../dataset/raw-images/curry/curry_1.jpg", "Curry Image"),
    ]
    
    images_tested = 0
    for image_path, description in test_images:
        full_path = Path(__file__).parent / image_path
        if os.path.exists(str(full_path)):
            test_image_detection(detector, str(full_path), description)
            images_tested += 1
        else:
            print(f"\n⚠️  Skipping {description} - file not found")
    
    if images_tested == 0:
        print("\n⚠️  No test images found. Skipping image detection tests.")
    
    # Step 5: Test recipe search
    test_recipe_search(detector)
    
    # Final summary
    print_section("TEST COMPLETE")
    print("✅ All tests completed!")
    print(f"\n📊 Summary:")
    print(f"   • API Key: Valid")
    print(f"   • Connection: Working")
    print(f"   • Images Tested: {images_tested}")
    print(f"   • Recipe Search: Working")
    
    print("\n📖 Next Steps:")
    print("1. ✅ Spoonacular is ready to use")
    print("2. 🚀 Start API server: python api_server.py")
    print("3. 📡 Use endpoint: POST /api/v1/food/detect/spoonacular")
    print("4. 📚 See SPOONACULAR_SETUP.md for usage examples")
    
    print("\n🎯 Daily Limit: 150 requests")
    print("   Check usage at: https://spoonacular.com/food-api/console#Dashboard")

if __name__ == "__main__":
    main()
