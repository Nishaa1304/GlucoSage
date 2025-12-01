"""
Automatically map all uploaded images to demo database
This ensures any image you upload will be recognized
"""
from pathlib import Path
from demo_food_mapper import DemoFoodMapper
import shutil

def auto_map_all_uploads():
    """Map all uploaded images to demo images"""
    mapper = DemoFoodMapper()
    uploads_dir = Path(__file__).parent / "uploads"
    demo_dir = Path(__file__).parent / "demo-images"
    
    print("🔄 Auto-mapping uploaded images to demo database")
    print("=" * 60)
    print()
    
    if not uploads_dir.exists():
        print("❌ No uploads folder found")
        return
    
    # Get all uploaded images
    uploaded_images = list(uploads_dir.glob("*.jpg")) + list(uploads_dir.glob("*.jpeg")) + list(uploads_dir.glob("*.png"))
    
    if not uploaded_images:
        print("❌ No uploaded images found")
        return
    
    print(f"Found {len(uploaded_images)} uploaded image(s)")
    print()
    
    # Get all demo images with their hashes
    demo_images = list(demo_dir.glob("*.jpg")) + list(demo_dir.glob("*.jpeg")) + list(demo_dir.glob("*.png"))
    demo_hashes = {}
    
    for demo_img in demo_images:
        if demo_img.name in ['HOW_TO_SAVE_IMAGES.md', 'README.md', 'SETUP_INSTRUCTIONS.md']:
            continue
        demo_hash = mapper.get_image_hash(str(demo_img))
        if demo_hash and demo_hash in mapper.mappings:
            demo_hashes[demo_hash] = (demo_img, mapper.mappings[demo_hash])
    
    print(f"Loaded {len(demo_hashes)} demo food mapping(s)")
    print()
    
    mapped_count = 0
    
    for uploaded_img in uploaded_images:
        upload_hash = mapper.get_image_hash(str(uploaded_img))
        
        if not upload_hash:
            print(f"⚠️  {uploaded_img.name}: Failed to calculate hash")
            continue
        
        if upload_hash in mapper.mappings:
            # Already mapped
            food_name = mapper.mappings[upload_hash]['name']
            print(f"✅ {uploaded_img.name}: Already mapped to '{food_name}'")
        else:
            # Try to match with a demo image
            # For demo_ prefixed files, try to find original
            if uploaded_img.name.startswith('demo_'):
                # Extract the original name
                original_name = uploaded_img.name.replace('demo_', '')
                
                # Look for matching demo image
                for demo_hash, (demo_img, food_data) in demo_hashes.items():
                    if demo_img.name == original_name or demo_img.name in uploaded_img.name:
                        # Use the same mapping as the demo image
                        mapper.mappings[upload_hash] = food_data
                        mapper.save_mappings()
                        print(f"✅ {uploaded_img.name}: Mapped to '{food_data['name']}'")
                        mapped_count += 1
                        break
                else:
                    print(f"⚠️  {uploaded_img.name}: No matching demo found")
            else:
                print(f"ℹ️  {uploaded_img.name}: Not a demo image (hash: {upload_hash[:16]}...)")
    
    print()
    print("=" * 60)
    print(f"✅ Mapping complete!")
    print(f"   New mappings: {mapped_count}")
    print(f"   Total mappings: {len(mapper.mappings)}")
    print()
    print("🎉 Now all your uploaded demo images will be recognized!")

if __name__ == '__main__':
    auto_map_all_uploads()
