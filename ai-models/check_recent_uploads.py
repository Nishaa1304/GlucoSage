"""
Check the most recently uploaded image and test if it's in the demo database
"""
from pathlib import Path
from demo_food_mapper import DemoFoodMapper
import os
from datetime import datetime

mapper = DemoFoodMapper()
uploads_dir = Path(__file__).parent / "uploads"

# Get all image files with their modification times
image_files = []
for ext in ['*.jpg', '*.jpeg', '*.png']:
    for img in uploads_dir.glob(ext):
        stat = img.stat()
        image_files.append((img, stat.st_mtime))

# Sort by modification time (most recent first)
image_files.sort(key=lambda x: x[1], reverse=True)

print("📋 Last 5 uploaded images (most recent first):")
print("=" * 70)
print()

for i, (img_path, mtime) in enumerate(image_files[:5], 1):
    mod_time = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
    img_hash = mapper.get_image_hash(str(img_path))
    in_db = img_hash in mapper.mappings if img_hash else False
    
    print(f"{i}. {img_path.name}")
    print(f"   Modified: {mod_time}")
    print(f"   Hash: {img_hash}")
    print(f"   In database: {'✅ YES' if in_db else '❌ NO'}")
    
    if in_db:
        food_data = mapper.mappings[img_hash]
        print(f"   Food: {food_data['name']}")
        print(f"   Calories: {food_data['nutrition']['calories']} kcal")
    
    print()

print("=" * 70)
print()
print("💡 TIP: If your uploaded images aren't being detected:")
print("   1. Make sure you're uploading the EXACT same image file from demo-images/")
print("   2. Don't take screenshots - use the original file")
print("   3. Browser might compress images - try copying demo images")
print("      to a temporary location and uploading from there")
