#!/usr/bin/env python3
"""
Download Indian Food Dataset from Roboflow Universe
"""

from roboflow import Roboflow
from pathlib import Path
import sys

def download_roboflow_dataset():
    """Download pre-labeled Indian food dataset"""
    
    print("🔍 Searching Roboflow Universe for Indian Food Datasets...")
    print()
    
    # Option 1: Direct download if you have API key
    api_key = input("Enter your Roboflow API key (or press Enter to skip): ").strip()
    
    if api_key:
        try:
            print("\n📦 Downloading dataset...")
            rf = Roboflow(api_key=api_key)
            
            # Try common Indian food datasets
            workspace = input("Enter workspace name: ").strip()
            project = input("Enter project name: ").strip()
            version = input("Enter version (default 1): ").strip() or "1"
            
            proj = rf.workspace(workspace).project(project)
            dataset = proj.version(int(version)).download("yolov8")
            
            print(f"\n✅ Dataset downloaded to: {dataset.location}")
            print("\nNext: Run python scripts/quick_train.py")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("\n💡 Try manual download instead:")
            show_manual_instructions()
    else:
        show_manual_instructions()

def show_manual_instructions():
    """Show manual download instructions"""
    print("\n" + "=" * 60)
    print("📖 MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 60)
    print()
    print("1. Go to: https://universe.roboflow.com/")
    print()
    print("2. Search for: 'indian food' or 'food detection'")
    print()
    print("3. Choose a dataset with:")
    print("   - 1000+ images")
    print("   - Object Detection (not classification)")
    print("   - Indian food classes")
    print()
    print("4. Click 'Download Dataset'")
    print("   - Format: YOLOv8 ⭐")
    print("   - Show download code: Yes")
    print()
    print("5. Copy the API code or download ZIP")
    print()
    print("6. Extract to:")
    print("   d:\\Yukti\\glucosage\\ai-models\\dataset\\roboflow-export\\")
    print()
    print("=" * 60)
    print()
    print("🎯 RECOMMENDED DATASETS:")
    print()
    print("A. 'Indian Food Detection' by various authors")
    print("   - Usually 10-15 classes")
    print("   - 1000-5000 images")
    print("   - Ready to use")
    print()
    print("B. 'Food Recognition' with Indian subset")
    print("   - Filter for Indian foods")
    print("   - Large dataset")
    print()
    print("C. Create your own in 5 minutes:")
    print("   - Upload 100 images (from Google)")
    print("   - Use Roboflow auto-label")
    print("   - Generate augmentations (10×)")
    print("   - Export")
    print()
    print("=" * 60)

if __name__ == '__main__':
    try:
        download_roboflow_dataset()
    except KeyboardInterrupt:
        print("\n\n👋 Cancelled")
        sys.exit(0)
