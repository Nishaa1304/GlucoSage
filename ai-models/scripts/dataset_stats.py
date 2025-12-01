#!/usr/bin/env python3
"""
Dataset Statistics Script
Shows progress, distribution, and readiness for training
"""

import os
from pathlib import Path
from collections import defaultdict
import json

def analyze_dataset(base_path: Path):
    """Analyze dataset collection progress"""
    
    raw_images_path = base_path / 'dataset' / 'raw-images'
    
    if not raw_images_path.exists():
        print("❌ dataset/raw-images folder not found!")
        return
    
    stats = {
        'total_images': 0,
        'classes': defaultdict(int),
        'total_classes': 0,
        'target_per_class': 300,
        'target_total': 0
    }
    
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp'}
    
    # Count images per class
    for food_folder in sorted(raw_images_path.iterdir()):
        if not food_folder.is_dir():
            continue
        
        food_name = food_folder.name
        image_count = sum(1 for f in food_folder.iterdir() 
                         if f.suffix.lower() in valid_extensions)
        
        stats['classes'][food_name] = image_count
        stats['total_images'] += image_count
        stats['total_classes'] += 1
    
    stats['target_total'] = stats['total_classes'] * stats['target_per_class']
    
    # Display results
    print("=" * 70)
    print("📊 GlucoSage Food Dataset - Collection Progress")
    print("=" * 70)
    print()
    
    # Overall progress
    progress_pct = (stats['total_images'] / stats['target_total'] * 100) if stats['target_total'] > 0 else 0
    
    print(f"🎯 Overall Progress: {stats['total_images']}/{stats['target_total']} images ({progress_pct:.1f}%)")
    print(f"📦 Classes: {stats['total_classes']}")
    print()
    
    # Progress bar
    bar_length = 40
    filled = int(bar_length * progress_pct / 100)
    bar = '█' * filled + '░' * (bar_length - filled)
    print(f"[{bar}] {progress_pct:.1f}%")
    print()
    
    # Per-class breakdown
    print("📈 Class Distribution:")
    print("-" * 70)
    print(f"{'Class':<20} {'Images':<10} {'Progress':<15} {'Status':<10}")
    print("-" * 70)
    
    complete_classes = 0
    in_progress_classes = 0
    empty_classes = 0
    
    for food, count in sorted(stats['classes'].items()):
        pct = (count / stats['target_per_class']) * 100
        bar_len = 10
        filled_bar = int(bar_len * pct / 100)
        progress_bar = '█' * filled_bar + '░' * (bar_len - filled_bar)
        
        if count >= stats['target_per_class']:
            status = "✅ Done"
            complete_classes += 1
        elif count > 0:
            status = "🔄 Active"
            in_progress_classes += 1
        else:
            status = "⭕ Empty"
            empty_classes += 1
        
        print(f"{food:<20} {count:>4}/{stats['target_per_class']:<4} [{progress_bar}] {pct:>5.1f}%  {status}")
    
    print("-" * 70)
    print()
    
    # Class status summary
    print("📊 Class Status:")
    print(f"  ✅ Complete:     {complete_classes}")
    print(f"  🔄 In Progress:  {in_progress_classes}")
    print(f"  ⭕ Not Started:  {empty_classes}")
    print()
    
    # Recommendations
    print("💡 Recommendations:")
    
    if stats['total_images'] == 0:
        print("  1. Run: python scripts/setup_dataset_folders.py")
        print("  2. Start collecting images (follow DATA_COLLECTION_CHECKLIST.md)")
        print("  3. Aim for 30 images per class per day")
    elif progress_pct < 25:
        print("  1. Focus on empty classes first")
        print("  2. Use diverse lighting and angles")
        print("  3. Target: 450 images/day across all classes")
    elif progress_pct < 50:
        print("  1. You're making good progress!")
        print("  2. Ensure variety in each class")
        print("  3. Start planning Roboflow upload")
    elif progress_pct < 75:
        print("  1. Over halfway! Keep going!")
        print("  2. Focus on classes below 200 images")
        print("  3. Prepare for labeling (review Roboflow docs)")
    elif progress_pct < 100:
        print("  1. Almost there! Final push!")
        print("  2. Complete remaining classes")
        print("  3. Run: python scripts/validate_images.py")
    else:
        print("  1. 🎉 Collection complete!")
        print("  2. Run validation: python scripts/validate_images.py")
        print("  3. Upload to Roboflow for labeling")
        print("  4. Follow labeling guidelines in DATA_COLLECTION_CHECKLIST.md")
    
    print()
    
    # Training readiness
    print("🎓 Training Readiness:")
    min_images_per_class = 200  # Minimum for decent training
    ready_classes = sum(1 for count in stats['classes'].values() if count >= min_images_per_class)
    
    if ready_classes == stats['total_classes']:
        print("  ✅ Ready to start training!")
        print("  ✅ All classes have sufficient data")
    else:
        need_more = stats['total_classes'] - ready_classes
        print(f"  ⚠️  {need_more} classes need more images (min 200 each)")
        print(f"  ⚠️  Current: {ready_classes}/{stats['total_classes']} classes ready")
    
    print()
    
    # Save stats
    stats_file = base_path / 'dataset' / 'collection_stats.json'
    with open(stats_file, 'w') as f:
        json.dump(dict(stats), f, indent=2, default=int)
    
    print(f"💾 Stats saved: {stats_file}")
    print()

if __name__ == '__main__':
    base_path = Path(__file__).parent.parent
    analyze_dataset(base_path)
