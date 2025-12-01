"""
Sync Demo Images - Generate hashes for all demo images
This ensures that demo images will be recognized when uploaded
"""
import sys
from pathlib import Path
from demo_food_mapper import DemoFoodMapper, DEMO_FOODS_DATABASE

def main():
    print("🔄 Syncing Demo Images with Database")
    print("=" * 60)
    print()
    
    mapper = DemoFoodMapper()
    demo_images_dir = Path(__file__).parent / "demo-images"
    
    if not demo_images_dir.exists():
        print(f"❌ Demo images directory not found: {demo_images_dir}")
        return
    
    # List all image files
    image_files = (
        list(demo_images_dir.glob("*.jpg")) + 
        list(demo_images_dir.glob("*.jpeg")) + 
        list(demo_images_dir.glob("*.png"))
    )
    
    # Exclude files that are not food images
    image_files = [f for f in image_files if not f.name.startswith('.')]
    
    print(f"Found {len(image_files)} image file(s) in demo-images/")
    print()
    
    updated_count = 0
    
    for img_path in image_files:
        print(f"Processing: {img_path.name}")
        
        # Calculate hash
        img_hash = mapper.get_image_hash(str(img_path))
        
        if not img_hash:
            print(f"  ⚠️  Failed to calculate hash, skipping")
            continue
        
        print(f"  Hash: {img_hash}")
        
        # Try to find matching food data by filename
        filename_base = img_path.stem.lower().replace('-', '_')
        
        # Check if this image already has a mapping
        if img_hash in mapper.mappings:
            existing = mapper.mappings[img_hash]
            print(f"  ✅ Already mapped to: {existing['name']}")
        else:
            # Try to find matching food data
            found_match = False
            
            # First try exact filename match
            if filename_base in DEMO_FOODS_DATABASE:
                food_data = DEMO_FOODS_DATABASE[filename_base]
                mapper.mappings[img_hash] = food_data
                mapper.save_mappings()
                print(f"  ✅ Mapped to: {food_data['name']}")
                updated_count += 1
                found_match = True
            else:
                # Try partial matching
                for food_key, food_data in DEMO_FOODS_DATABASE.items():
                    if food_key in filename_base or filename_base in food_key:
                        mapper.mappings[img_hash] = food_data
                        mapper.save_mappings()
                        print(f"  ✅ Matched '{filename_base}' → '{food_data['name']}'")
                        updated_count += 1
                        found_match = True
                        break
            
            if not found_match:
                print(f"  ⚠️  No matching food data found for: {filename_base}")
                print(f"     Available keys: {', '.join(DEMO_FOODS_DATABASE.keys())}")
        
        print()
    
    print("=" * 60)
    print(f"✅ Sync complete!")
    print(f"   Updated: {updated_count} new mapping(s)")
    print(f"   Total mappings: {len(mapper.mappings)}")
    print()
    print("🎉 Demo images are now ready to use!")
    print()
    print("📋 Current demo foods:")
    for i, (hash_key, data) in enumerate(mapper.mappings.items(), 1):
        print(f"   {i}. {data['name']} ({data['nutrition']['calories']} kcal)")

if __name__ == '__main__':
    main()
