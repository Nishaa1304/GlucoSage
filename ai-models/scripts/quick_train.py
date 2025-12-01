#!/usr/bin/env python3
"""
Quick Train: Train YOLOv8 on Indian Food Dataset
Optimized for fast training (2-4 hours)
"""

from ultralytics import YOLO
from pathlib import Path
import sys
import yaml

def quick_train():
    """Quick training with pre-configured settings"""
    
    print("🚀 Quick Training Setup")
    print("=" * 60)
    print()
    
    # Check for dataset
    dataset_path = Path(__file__).parent.parent / 'dataset' / 'roboflow-export'
    
    if not dataset_path.exists():
        print("❌ Dataset not found!")
        print(f"Expected location: {dataset_path}")
        print()
        print("Please download dataset first:")
        print("  python scripts/download_dataset.py")
        sys.exit(1)
    
    # Find data.yaml
    data_yaml = None
    for yaml_file in dataset_path.rglob('data.yaml'):
        data_yaml = yaml_file
        break
    
    if not data_yaml:
        print("❌ data.yaml not found in dataset folder")
        print("Please ensure dataset is properly extracted")
        sys.exit(1)
    
    print(f"✅ Found dataset: {data_yaml}")
    print()
    
    # Load and check dataset config
    with open(data_yaml, 'r') as f:
        data_config = yaml.safe_load(f)
    
    print(f"📊 Dataset Info:")
    print(f"   Classes: {len(data_config.get('names', []))}")
    print(f"   Names: {', '.join(data_config.get('names', []))}")
    print()
    
    # Ask for training settings
    print("⚙️ Training Settings:")
    print()
    print("Choose training mode:")
    print("  1. FAST (50 epochs, ~2 hours) - For demo")
    print("  2. BALANCED (100 epochs, ~4 hours) - Good quality")
    print("  3. BEST (200 epochs, ~8 hours) - Production")
    print()
    
    choice = input("Enter choice (1/2/3, default 1): ").strip() or "1"
    
    epochs_map = {'1': 50, '2': 100, '3': 200}
    epochs = epochs_map.get(choice, 50)
    
    print()
    print(f"🎯 Training with {epochs} epochs")
    print()
    
    # Check for GPU
    import torch
    if torch.cuda.is_available():
        print(f"✅ GPU detected: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        print("⚠️  No GPU - using CPU (will be slower)")
        device = 'cpu'
    
    print()
    print("🚀 Starting training...")
    print("   This will take 2-8 hours depending on settings")
    print("   You can close this window - training continues")
    print()
    
    # Initialize model
    model = YOLO('yolov8n.pt')  # nano model for speed
    
    # Training parameters
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=640,
        batch=16,  # Adjust based on GPU memory
        device=device,
        project='models/food-recognition',
        name='indian-food-v1',
        patience=20,  # Early stopping
        save=True,
        save_period=10,  # Save checkpoint every 10 epochs
        cache=True,  # Cache images for faster training
        workers=4,
        verbose=True
    )
    
    print()
    print("=" * 60)
    print("🎉 Training Complete!")
    print("=" * 60)
    print()
    print(f"📊 Results:")
    print(f"   mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
    print(f"   Precision: {results.results_dict.get('metrics/precision(B)', 'N/A')}")
    print(f"   Recall: {results.results_dict.get('metrics/recall(B)', 'N/A')}")
    print()
    print(f"📁 Model saved to:")
    print(f"   models/food-recognition/indian-food-v1/weights/best.pt")
    print()
    print("🎯 Next Steps:")
    print("   1. Test model: python scripts/test_model.py")
    print("   2. Update food_detection_service.py with new model")
    print("   3. Start API server: python api_server.py")
    print()

if __name__ == '__main__':
    try:
        quick_train()
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted")
        print("Training can be resumed from last checkpoint")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
