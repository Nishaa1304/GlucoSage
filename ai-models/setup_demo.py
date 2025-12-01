"""
Setup Demo Images for GlucoSage
Run this after adding images to demo-images folder
"""
from demo_food_mapper import DemoFoodMapper, DEMO_FOODS_DATABASE
from pathlib import Path
import shutil

def setup_demo_images():
    """Setup demo images with pre-configured food data"""
    
    mapper = DemoFoodMapper()
    demo_dir = Path(__file__).parent / "demo-images"
    
    print("🎯 GlucoSage Demo Image Setup")
    print("=" * 60)
    
    # Instructions
    print("\n📋 INSTRUCTIONS:")
    print("1. Add 3-4 food images to: demo-images/")
    print("2. Name them clearly:")
    print("   - biryani.jpg")
    print("   - dosa.jpg")
    print("   - idli.jpg")
    print("   - thali.jpg")
    print("3. Run this script again")
    print("\n" + "=" * 60)
    
    # Check for images
    images = list(demo_dir.glob("*.jpg")) + list(demo_dir.glob("*.png")) + list(demo_dir.glob("*.jpeg"))
    
    if not images:
        print("\n⚠️  No images found in demo-images/")
        print("Please add images first!")
        return
    
    print(f"\n✅ Found {len(images)} images:")
    for img in images:
        print(f"   • {img.name}")
    
    print("\n🔧 Mapping images to food data...")
    
    # Auto-detect food type from filename and map
    for img_path in images:
        filename = img_path.stem.lower()
        
        # Match filename to food database
        matched = False
        for food_id, food_data in DEMO_FOODS_DATABASE.items():
            if food_id.replace('_', '') in filename.replace('_', '').replace('-', ''):
                print(f"\n📸 Processing: {img_path.name}")
                print(f"   Detected as: {food_data['name']}")
                
                if mapper.add_demo_image(str(img_path), food_data):
                    matched = True
                    print(f"   ✅ Mapped successfully!")
                break
        
        if not matched:
            print(f"\n⚠️  Could not auto-detect food type for: {img_path.name}")
            print("   Please rename to one of these:")
            for food_id in DEMO_FOODS_DATABASE.keys():
                print(f"      - {food_id}.jpg")
    
    print("\n" + "=" * 60)
    print("✅ DEMO SETUP COMPLETE!")
    print("=" * 60)
    print("\nConfigured demo foods:")
    
    demo_foods = mapper.list_demo_foods()
    for food in demo_foods:
        print(f"  • {food['name']}")
        print(f"    Portion: {food['portion']}")
        print(f"    Calories: {food['calories']} kcal\n")
    
    print("🚀 Ready to demo! Use endpoint: /api/v1/food/detect/demo")
    print("\nUpdate frontend to use:")
    print("   AI_API_URL = 'http://localhost:5001/api/v1/food/detect/demo'")
    print("=" * 60)

if __name__ == '__main__':
    setup_demo_images()
