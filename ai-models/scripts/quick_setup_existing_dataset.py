#!/usr/bin/env python3
"""
Quick Setup: Use Existing Indian Food Dataset
Downloads pre-labeled dataset from Roboflow Universe
"""

import os
import sys
from pathlib import Path
import subprocess

def quick_setup_with_existing_dataset():
    """Download and setup existing Indian food dataset"""
    
    print("🚀 Quick Setup: Using Existing Dataset")
    print("=" * 60)
    print()
    
    print("📦 Option 1: Roboflow Universe - Indian Food Dataset")
    print("   Available pre-labeled datasets:")
    print()
    print("   1. Indian Food Images (1000+ images)")
    print("      URL: roboflow.com/ds/indian-food")
    print()
    print("   2. Food-101 (Indian subset, 2000+ images)")
    print("      URL: roboflow.com/ds/food101")
    print()
    print("   3. Open Images - Food (filtered for Indian)")
    print("      URL: opensource.google/projects/open-images-dataset")
    print()
    
    print("📦 Option 2: Kaggle Datasets")
    print()
    print("   1. Indian Food Images Dataset")
    print("      https://www.kaggle.com/datasets/iamsouravbanerjee/indian-food-images-dataset")
    print()
    print("   2. Indian Food Classification")
    print("      https://www.kaggle.com/datasets/nehaprabhavalkar/indian-food-classify")
    print()
    
    print("🎯 FASTEST OPTION (Recommended for Tomorrow):")
    print("=" * 60)
    print()
    print("Use Roboflow's Public Workspace:")
    print()
    print("1. Go to: https://universe.roboflow.com/")
    print("2. Search: 'indian food detection'")
    print("3. Find a dataset with 1000+ images")
    print("4. Click 'Download Dataset'")
    print("5. Format: YOLOv8")
    print("6. Copy API code snippet")
    print()
    print("Example API download code:")
    print("-" * 60)
    print("""
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("WORKSPACE").project("PROJECT_NAME")
dataset = project.version(1).download("yolov8")
    """)
    print("-" * 60)
    print()
    
    print("💡 After Download:")
    print("1. Extract to: ai-models/dataset/roboflow-export/")
    print("2. Run: python scripts/quick_train.py")
    print("3. Wait 2-4 hours (training)")
    print("4. Deploy & demo!")
    print()
    
    print("🔧 Installing Roboflow CLI...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "roboflow"], 
                      check=True, capture_output=True)
        print("✅ Roboflow installed")
    except:
        print("⚠️  Install manually: pip install roboflow")
    
    print()
    print("📝 Next Steps:")
    print("1. Choose a dataset from options above")
    print("2. Run: python scripts/download_dataset.py")
    print("3. Or manually download from Roboflow Universe")
    print()

if __name__ == '__main__':
    quick_setup_with_existing_dataset()
