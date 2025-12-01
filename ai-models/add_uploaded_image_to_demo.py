"""
Add Uploaded Images to Demo Database
This script helps you map your uploaded images to demo food data
"""
import sys
import os
from pathlib import Path
from demo_food_mapper import DemoFoodMapper

def main():
    mapper = DemoFoodMapper()
    
    print("🎯 Add Uploaded Image to Demo Database")
    print("=" * 60)
    print()
    
    # Check uploads folder
    uploads_dir = Path(__file__).parent / "uploads"
    if not uploads_dir.exists():
        print("❌ Uploads folder not found!")
        print(f"   Expected: {uploads_dir}")
        return
    
    # List uploaded images
    uploaded_images = list(uploads_dir.glob("*.jpg")) + list(uploads_dir.glob("*.jpeg")) + list(uploads_dir.glob("*.png"))
    
    if not uploaded_images:
        print("❌ No images found in uploads folder!")
        print(f"   Location: {uploads_dir}")
        print()
        print("💡 Upload an image through the food scanner first")
        return
    
    print(f"Found {len(uploaded_images)} uploaded image(s):")
    print()
    
    for i, img_path in enumerate(uploaded_images, 1):
        print(f"{i}. {img_path.name}")
    
    print()
    print("Which image do you want to add to the demo database?")
    choice = input("Enter number (or 'q' to quit): ").strip()
    
    if choice.lower() == 'q':
        return
    
    try:
        idx = int(choice) - 1
        if idx < 0 or idx >= len(uploaded_images):
            print("❌ Invalid choice!")
            return
        
        selected_image = uploaded_images[idx]
        print()
        print(f"Selected: {selected_image.name}")
        print()
        
        # Get image hash
        img_hash = mapper.get_image_hash(str(selected_image))
        if not img_hash:
            print("❌ Failed to calculate image hash!")
            return
        
        print(f"📝 Image hash: {img_hash}")
        print()
        
        # Check if already exists
        if img_hash in mapper.mappings:
            existing = mapper.mappings[img_hash]
            print(f"⚠️  This image is already mapped to: {existing['name']}")
            print()
            overwrite = input("Do you want to overwrite? (y/n): ").strip().lower()
            if overwrite != 'y':
                return
            print()
        
        # Get food data
        print("Enter food information:")
        print("(Press Enter to use defaults shown in brackets)")
        print()
        
        name = input("Food name [Chicken Biryani]: ").strip() or "Chicken Biryani"
        portion = input("Portion size (small/medium/large) [large]: ").strip() or "large"
        weight = input("Weight in grams [350]: ").strip()
        weight = int(weight) if weight else 350
        
        print()
        print("Nutrition information:")
        calories = input("Calories [450]: ").strip()
        calories = int(calories) if calories else 450
        
        carbs = input("Carbohydrates (g) [60]: ").strip()
        carbs = int(carbs) if carbs else 60
        
        protein = input("Protein (g) [18]: ").strip()
        protein = int(protein) if protein else 18
        
        fat = input("Fat (g) [15]: ").strip()
        fat = int(fat) if fat else 15
        
        fiber = input("Fiber (g) [3]: ").strip()
        fiber = int(fiber) if fiber else 3
        
        sugar = input("Sugar (g) [2]: ").strip()
        sugar = int(sugar) if sugar else 2
        
        sodium = input("Sodium (mg) [650]: ").strip()
        sodium = int(sodium) if sodium else 650
        
        print()
        print("Glycemic information:")
        gi = input("Glycemic Index (0-100) [58]: ").strip()
        gi = int(gi) if gi else 58
        
        gl = input("Glycemic Load [35]: ").strip()
        gl = int(gl) if gl else 35
        
        print()
        print("Glucose prediction:")
        peak_time = input("Peak time (minutes) [45]: ").strip()
        peak_time = int(peak_time) if peak_time else 45
        
        peak_increase = input("Peak glucose increase (mg/dL) [65]: ").strip()
        peak_increase = int(peak_increase) if peak_increase else 65
        
        duration = input("Duration (hours) [2.5]: ").strip()
        duration = float(duration) if duration else 2.5
        
        advice = input("Health advice [Moderate glycemic load. Consider portion control.]: ").strip()
        advice = advice if advice else "Moderate glycemic load. Consider portion control."
        
        # Create food data
        food_data = {
            'name': name,
            'portion_size': portion,
            'weight_grams': weight,
            'nutrition': {
                'calories': calories,
                'carbohydrates': carbs,
                'protein': protein,
                'fat': fat,
                'fiber': fiber,
                'sugar': sugar,
                'sodium': sodium
            },
            'glycemic_index': gi,
            'glycemic_load': gl,
            'glucose_prediction': {
                'peak_time_minutes': peak_time,
                'peak_increase_mg_dl': peak_increase,
                'duration_hours': duration,
                'advice': advice
            }
        }
        
        # Add to mapper
        mapper.mappings[img_hash] = food_data
        mapper.save_mappings()
        
        print()
        print("=" * 60)
        print("✅ SUCCESS!")
        print(f"   Added '{name}' to demo database")
        print(f"   Hash: {img_hash}")
        print()
        print("🎉 Now when you upload this image, it will be recognized!")
        print()
        
        # Optionally copy to demo-images folder
        demo_images_dir = Path(__file__).parent / "demo-images"
        copy_to_demo = input(f"Copy image to demo-images folder? (y/n): ").strip().lower()
        if copy_to_demo == 'y':
            import shutil
            safe_name = name.lower().replace(' ', '-') + selected_image.suffix
            dest_path = demo_images_dir / safe_name
            shutil.copy2(selected_image, dest_path)
            print(f"✅ Copied to: {dest_path.name}")
        
    except ValueError as e:
        print(f"❌ Invalid input: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
