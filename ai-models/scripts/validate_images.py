#!/usr/bin/env python3
"""
Image Validation Script
Checks image quality, format, and readability
"""

import os
from pathlib import Path
from PIL import Image
import json

def validate_images(base_path: Path):
    """Validate all images in raw-images folder"""
    
    raw_images_path = base_path / 'dataset' / 'raw-images'
    
    if not raw_images_path.exists():
        print("❌ dataset/raw-images folder not found!")
        print("Run: python scripts/setup_dataset_folders.py")
        return
    
    results = {
        'total_images': 0,
        'valid_images': 0,
        'invalid_images': 0,
        'by_class': {},
        'errors': []
    }
    
    print("🔍 Validating images...")
    print()
    
    # Supported formats
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp'}
    
    # Scan all folders
    for food_folder in raw_images_path.iterdir():
        if not food_folder.is_dir():
            continue
        
        food_name = food_folder.name
        class_stats = {
            'count': 0,
            'valid': 0,
            'invalid': 0,
            'min_size': float('inf'),
            'max_size': 0,
            'avg_size': []
        }
        
        print(f"📁 Checking {food_name}...")
        
        for img_file in food_folder.iterdir():
            if img_file.suffix.lower() not in valid_extensions:
                continue
            
            results['total_images'] += 1
            class_stats['count'] += 1
            
            try:
                # Try to open image
                with Image.open(img_file) as img:
                    width, height = img.size
                    file_size = img_file.stat().st_size / 1024  # KB
                    
                    # Validation checks
                    errors = []
                    
                    # Check 1: Minimum resolution
                    if width < 400 or height < 400:
                        errors.append(f"Too small: {width}×{height}px")
                    
                    # Check 2: Aspect ratio (shouldn't be too extreme)
                    aspect_ratio = max(width, height) / min(width, height)
                    if aspect_ratio > 3:
                        errors.append(f"Extreme aspect ratio: {aspect_ratio:.1f}:1")
                    
                    # Check 3: File size
                    if file_size < 50:
                        errors.append(f"File too small: {file_size:.1f}KB")
                    elif file_size > 10240:  # 10MB
                        errors.append(f"File too large: {file_size:.1f}KB")
                    
                    # Check 4: Image mode
                    if img.mode not in ['RGB', 'RGBA', 'L']:
                        errors.append(f"Unsupported mode: {img.mode}")
                    
                    if errors:
                        results['invalid_images'] += 1
                        class_stats['invalid'] += 1
                        results['errors'].append({
                            'file': str(img_file),
                            'errors': errors
                        })
                    else:
                        results['valid_images'] += 1
                        class_stats['valid'] += 1
                        class_stats['avg_size'].append(width * height)
                        class_stats['min_size'] = min(class_stats['min_size'], min(width, height))
                        class_stats['max_size'] = max(class_stats['max_size'], max(width, height))
                    
            except Exception as e:
                results['invalid_images'] += 1
                class_stats['invalid'] += 1
                results['errors'].append({
                    'file': str(img_file),
                    'errors': [f"Cannot open: {str(e)}"]
                })
        
        # Calculate average size
        if class_stats['avg_size']:
            class_stats['avg_size'] = int(sum(class_stats['avg_size']) / len(class_stats['avg_size']))
        else:
            class_stats['avg_size'] = 0
        
        results['by_class'][food_name] = class_stats
        
        # Print class summary
        status = "✅" if class_stats['invalid'] == 0 else "⚠️"
        print(f"  {status} {class_stats['valid']}/{class_stats['count']} valid")
    
    print()
    print("=" * 60)
    print("📊 Validation Summary")
    print("=" * 60)
    print(f"Total images:   {results['total_images']}")
    print(f"✅ Valid:       {results['valid_images']}")
    print(f"❌ Invalid:     {results['invalid_images']}")
    print()
    
    print("📈 By Class:")
    for food, stats in sorted(results['by_class'].items()):
        progress = "✅" if stats['count'] >= 300 else "🔄"
        print(f"{progress} {food:15s} {stats['valid']:4d}/300 images")
    
    print()
    
    # Show errors if any
    if results['errors']:
        print("⚠️  Issues Found:")
        for error in results['errors'][:10]:  # Show first 10
            print(f"  - {Path(error['file']).name}: {', '.join(error['errors'])}")
        
        if len(results['errors']) > 10:
            print(f"  ... and {len(results['errors']) - 10} more")
        print()
        print("💡 Fix these issues before uploading to Roboflow")
    else:
        print("🎉 All images passed validation!")
    
    # Save detailed report
    report_path = base_path / 'dataset' / 'validation_report.json'
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print()
    print(f"📝 Detailed report saved: {report_path}")
    
    # Progress assessment
    total_needed = len(results['by_class']) * 300
    progress_pct = (results['valid_images'] / total_needed * 100) if total_needed > 0 else 0
    
    print()
    print(f"📊 Overall Progress: {progress_pct:.1f}% ({results['valid_images']}/{total_needed})")
    
    if progress_pct >= 100:
        print("🎉 Dataset complete! Ready to upload to Roboflow.")
    elif progress_pct >= 50:
        print("💪 Halfway there! Keep collecting.")
    else:
        print("🚀 Just getting started. You got this!")

if __name__ == '__main__':
    base_path = Path(__file__).parent.parent
    validate_images(base_path)
