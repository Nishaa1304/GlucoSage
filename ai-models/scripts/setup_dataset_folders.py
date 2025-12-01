#!/usr/bin/env python3
"""
Setup Dataset Folder Structure
Creates all necessary folders for data collection and training
"""

import os
from pathlib import Path

# Food classes
FOOD_CLASSES = [
    'roti',
    'dal',
    'rice',
    'biryani',
    'curry',
    'idli',
    'dosa',
    'paratha',
    'samosa',
    'paneer_dish',
    'chole',
    'raita',
    'salad',
    'sabzi',
    'sweet'
]

def create_folder_structure():
    """Create complete dataset folder structure"""
    
    base_path = Path(__file__).parent.parent
    
    folders = [
        # Raw images by class
        *[f'dataset/raw-images/{food}' for food in FOOD_CLASSES],
        
        # Multi-food scenarios
        'dataset/raw-images/thali',
        'dataset/raw-images/mixed',
        
        # Roboflow export
        'dataset/roboflow-export',
        
        # Final training data
        'dataset/training-data/train/images',
        'dataset/training-data/train/labels',
        'dataset/training-data/val/images',
        'dataset/training-data/val/labels',
        'dataset/training-data/test/images',
        'dataset/training-data/test/labels',
        
        # Model outputs
        'models/food-recognition/weights',
        'models/food-recognition/runs',
        
        # Glucose data
        'dataset/glucose-data',
        
        # Validation scripts
        'scripts/validation',
    ]
    
    print("🚀 Setting up dataset folder structure...")
    print(f"📁 Base path: {base_path}")
    print()
    
    created_count = 0
    for folder in folders:
        folder_path = base_path / folder
        if not folder_path.exists():
            folder_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created: {folder}")
            created_count += 1
        else:
            print(f"⏭️  Already exists: {folder}")
    
    print()
    print(f"🎉 Setup complete! Created {created_count} new folders.")
    print()
    print("📋 Next steps:")
    print("1. Start collecting images in dataset/raw-images/<food-name>/")
    print("2. Follow DATA_COLLECTION_CHECKLIST.md")
    print("3. Upload to Roboflow for labeling")
    print()
    print("💡 Tip: Aim for 300 images per food class!")

if __name__ == '__main__':
    create_folder_structure()
