# YOLOv8 Training Guide for Indian Food Detection

## 🎯 Training Objectives

Build a multi-food object detection model that:
- Detects 15+ Indian food items simultaneously
- Handles overlapping foods in thali arrangements
- Works on various plate types and lighting
- Achieves **>85% mAP@0.5** on test set
- Runs in real-time on mobile devices

---

## 🛠️ Setup Environment

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv yolo_env
source yolo_env/bin/activate  # On Windows: yolo_env\Scripts\activate

# Install required packages
pip install ultralytics==8.0.196
pip install roboflow
pip install opencv-python
pip install matplotlib
pip install pandas
pip install pillow
```

### 2. Download Dataset from Roboflow

```python
# download_dataset.py
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_ROBOFLOW_API_KEY")
project = rf.workspace("your-workspace").project("indian-food-detection")
dataset = project.version(1).download("yolov8")

print(f"Dataset downloaded to: {dataset.location}")
```

**Output structure:**
```
indian-food-detection-1/
├── data.yaml          # Dataset config
├── train/
│   ├── images/
│   └── labels/
├── valid/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

---

## 📋 Training Configuration

### Recommended Hyperparameters

```yaml
# config.yaml
model: yolov8n.pt  # Start with nano, upgrade to yolov8s/m if needed
data: ./indian-food-detection-1/data.yaml

# Image settings
imgsz: 640  # Input image size (640x640)
batch: 16   # Reduce to 8 if GPU memory < 8GB

# Training duration
epochs: 100  # Start with 100, extend to 150 if improving
patience: 20 # Early stopping patience

# Learning rate
lr0: 0.01      # Initial learning rate
lrf: 0.01      # Final learning rate (lr0 * lrf)
momentum: 0.937
weight_decay: 0.0005

# Augmentation (applied on-the-fly)
hsv_h: 0.015  # Hue augmentation
hsv_s: 0.7    # Saturation
hsv_v: 0.4    # Value (brightness)
degrees: 15.0  # Rotation
translate: 0.1 # Translation
scale: 0.5     # Zoom
flipud: 0.0    # No vertical flip (food doesn't appear upside down)
fliplr: 0.5    # Horizontal flip
mosaic: 1.0    # Mosaic augmentation
mixup: 0.1     # Mix two images

# Optimization
optimizer: AdamW  # or SGD
close_mosaic: 10  # Disable mosaic last 10 epochs for stability

# Hardware
device: 0  # GPU 0, use 'cpu' if no GPU
workers: 8 # Data loading workers
```

---

## 🚀 Training Script

### Basic Training

```python
# train.py
from ultralytics import YOLO

# Load pretrained model
model = YOLO('yolov8n.pt')  # nano model (fastest)
# Alternative: yolov8s.pt (small), yolov8m.pt (medium) for better accuracy

# Train the model
results = model.train(
    data='./indian-food-detection-1/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0,  # GPU 0
    patience=20,
    save=True,
    plots=True,
    
    # Augmentation
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=15,
    translate=0.1,
    scale=0.5,
    flipud=0.0,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.1,
    
    # Optimization
    optimizer='AdamW',
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    
    # Output
    name='indian_food_v1',
    exist_ok=True
)

print("Training completed!")
print(f"Best model saved at: runs/detect/indian_food_v1/weights/best.pt")
```

### Advanced Training with Validation Monitoring

```python
# train_advanced.py
from ultralytics import YOLO
import torch

# Check GPU availability
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")

# Load model
model = YOLO('yolov8s.pt')  # Using small model for better accuracy

# Custom callback for monitoring
def on_train_epoch_end(trainer):
    """Log metrics after each epoch"""
    metrics = trainer.metrics
    print(f"Epoch {trainer.epoch}: mAP50={metrics.get('metrics/mAP50(B)', 0):.3f}")

# Add callback
model.add_callback("on_train_epoch_end", on_train_epoch_end)

# Train
results = model.train(
    data='./indian-food-detection-1/data.yaml',
    epochs=120,
    imgsz=640,
    batch=16,
    device=0,
    patience=25,
    save=True,
    plots=True,
    val=True,
    
    # Indian food specific augmentations
    hsv_h=0.01,   # Less hue shift (preserve food color)
    hsv_s=0.6,    # Moderate saturation
    hsv_v=0.4,    # Brightness variation (lighting)
    degrees=12,   # Less rotation (thalis are usually level)
    translate=0.1,
    scale=0.4,    # Zoom variation
    flipud=0.0,   # No upside down
    fliplr=0.5,   # 50% horizontal flip
    mosaic=1.0,   # Good for thali detection
    mixup=0.15,   # Slight mixup
    copy_paste=0.1,  # Copy-paste augmentation
    
    # Optimization
    optimizer='AdamW',
    lr0=0.01,
    lrf=0.01,
    warmup_epochs=3,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    
    # Class weights (if some classes are rare)
    # cls_weight=1.0,
    
    name='indian_food_v2',
    exist_ok=True,
    verbose=True
)

# Validate on test set
test_results = model.val(
    data='./indian-food-detection-1/data.yaml',
    split='test'
)

print(f"\nTest Set Results:")
print(f"mAP50: {test_results.box.map50:.3f}")
print(f"mAP50-95: {test_results.box.map:.3f}")
```

---

## 📊 Monitoring Training Progress

### Key Metrics to Watch

1. **mAP50** (mean Average Precision @ IoU 0.5)
   - Target: **>0.85** for production
   - Measures overall detection accuracy

2. **mAP50-95** (mean Average Precision @ IoU 0.5-0.95)
   - Target: **>0.60** for production
   - Stricter metric, harder to achieve

3. **Precision**
   - Target: **>0.80**
   - Few false positives (model doesn't hallucinate food)

4. **Recall**
   - Target: **>0.75**
   - Model detects most foods (doesn't miss items)

5. **Loss Functions**
   - `box_loss`: Bounding box regression loss (should decrease)
   - `cls_loss`: Classification loss (should decrease)
   - `dfl_loss`: Distribution focal loss (should decrease)

### TensorBoard Monitoring

```bash
# View training in real-time
tensorboard --logdir runs/detect/indian_food_v1
```

Or access logs programmatically:
```python
# check_progress.py
import pandas as pd

# Load results
results = pd.read_csv('runs/detect/indian_food_v1/results.csv')

# Plot metrics
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].plot(results['epoch'], results['metrics/mAP50(B)'])
axes[0, 0].set_title('mAP50 over epochs')

axes[0, 1].plot(results['epoch'], results['metrics/precision(B)'])
axes[0, 1].set_title('Precision over epochs')

axes[1, 0].plot(results['epoch'], results['train/box_loss'])
axes[1, 0].set_title('Box Loss')

axes[1, 1].plot(results['epoch'], results['train/cls_loss'])
axes[1, 1].set_title('Classification Loss')

plt.tight_layout()
plt.savefig('training_progress.png')
print("Training progress saved to training_progress.png")
```

---

## 🎯 Handling Common Issues

### Issue 1: Overfitting
**Symptoms**: Train mAP high, validation mAP low

**Solutions**:
```python
# Increase augmentation
hsv_v=0.6,
degrees=20,
mosaic=1.0,
mixup=0.2,

# Add dropout (edit model config)
dropout=0.1,

# Reduce model size
model = YOLO('yolov8n.pt')  # Use nano instead of small

# Collect more data
```

### Issue 2: Low mAP on Specific Classes
**Symptoms**: Some foods detected well, others poorly

**Solutions**:
```python
# Check class distribution
python check_dataset.py  # See below

# Collect more images for weak classes
# Minimum 250 images per class

# Adjust class weights (if severe imbalance)
# Edit data.yaml to add weights
```

```python
# check_dataset.py
import os
from collections import Counter

labels_dir = './indian-food-detection-1/train/labels'
class_counts = Counter()

for label_file in os.listdir(labels_dir):
    with open(os.path.join(labels_dir, label_file), 'r') as f:
        for line in f:
            class_id = int(line.split()[0])
            class_counts[class_id] += 1

# Map to class names (from data.yaml)
class_names = ['roti', 'chapati', 'poha', 'upma', 'idli', 'dosa', 
               'dal', 'rice', 'pulao', 'biryani', 'sabzi', 'curry',
               'paratha', 'fruits', 'vegetables']

print("Class distribution:")
for class_id, count in sorted(class_counts.items()):
    print(f"{class_names[class_id]}: {count} instances")
```

### Issue 3: Model Can't Distinguish Similar Items
**Symptoms**: Confuses roti/chapati or dal/curry

**Solutions**:
```python
# Collect side-by-side comparison images
# Focus on distinguishing features

# Use larger model for better feature extraction
model = YOLO('yolov8m.pt')

# Increase image size
imgsz=800,  # Instead of 640

# Reduce mosaic (preserves fine details)
mosaic=0.5,
```

### Issue 4: Poor Performance on Thali Images
**Symptoms**: Misses small items, wrong boxes on overlapping foods

**Solutions**:
```python
# Enable mosaic augmentation
mosaic=1.0,

# Adjust anchor boxes (automatic in YOLOv8)
# Focus on small object detection

# Collect more thali images (30% of dataset)

# Use multi-scale training
scale=0.5,  # More zoom variation
```

### Issue 5: Slow Training
**Symptoms**: <10 epochs per hour

**Solutions**:
```bash
# Reduce batch size
batch=8,  # Instead of 16

# Use fewer workers
workers=4,

# Reduce image size (not recommended unless necessary)
imgsz=512,

# Use smaller model
model = YOLO('yolov8n.pt')

# Enable mixed precision training (automatic in newer versions)
amp=True,
```

---

## 🏆 Achieving High Accuracy

### Step 1: Start with Baseline (Week 1)
```python
# Quick training to validate pipeline
model = YOLO('yolov8n.pt')
results = model.train(
    data='./indian-food-detection-1/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    patience=10
)
# Target: mAP50 > 0.70
```

### Step 2: Improve Dataset (Week 2-3)
- Review false positives/negatives
- Add more images for weak classes
- Improve labeling consistency
- Add challenging scenarios

### Step 3: Optimize Hyperparameters (Week 3)
```python
# Use learning rate finder
from ultralytics.utils import IterableSimpleNamespace

# Try different learning rates
for lr in [0.001, 0.005, 0.01, 0.02]:
    model = YOLO('yolov8s.pt')
    results = model.train(
        data='./indian-food-detection-1/data.yaml',
        epochs=30,
        lr0=lr,
        name=f'lr_test_{lr}'
    )
```

### Step 4: Scale Up Model (Week 4)
```python
# Use larger model if mAP plateaus
model = YOLO('yolov8m.pt')  # Medium model
results = model.train(
    data='./indian-food-detection-1/data.yaml',
    epochs=150,
    imgsz=640,
    batch=12,  # Reduce batch for larger model
    patience=30
)
# Target: mAP50 > 0.87
```

### Step 5: Ensemble (Optional)
```python
# Combine predictions from multiple models
from ultralytics import YOLO

model1 = YOLO('runs/detect/indian_food_v1/weights/best.pt')
model2 = YOLO('runs/detect/indian_food_v2/weights/best.pt')

# Predict with both
results1 = model1.predict('test_image.jpg')
results2 = model2.predict('test_image.jpg')

# Implement weighted box fusion (WBF)
# Use ensemble_boxes library
```

---

## 🔬 Testing and Validation

### Test on Real Images

```python
# test_model.py
from ultralytics import YOLO
import cv2

# Load best model
model = YOLO('runs/detect/indian_food_v2/weights/best.pt')

# Test on single image
results = model.predict(
    'test_thali.jpg',
    conf=0.25,  # Confidence threshold
    iou=0.45,   # NMS IoU threshold
    save=True,
    show_labels=True,
    show_conf=True
)

# Access results
for result in results:
    boxes = result.boxes
    for box in boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].cpu().numpy()
        
        print(f"Class: {model.names[cls]}, Confidence: {conf:.2f}")
        print(f"Box: {xyxy}")
```

### Batch Testing

```python
# test_batch.py
from ultralytics import YOLO
import os
from pathlib import Path

model = YOLO('runs/detect/indian_food_v2/weights/best.pt')

test_dir = './test_images'
results = model.predict(
    source=test_dir,
    conf=0.25,
    save=True,
    save_txt=True,  # Save labels
    save_conf=True
)

# Calculate per-class accuracy
from collections import defaultdict

class_stats = defaultdict(lambda: {'correct': 0, 'total': 0})

for result in results:
    # Compare with ground truth
    # Implement your validation logic here
    pass

print("Per-class accuracy:")
for cls, stats in class_stats.items():
    acc = stats['correct'] / stats['total'] if stats['total'] > 0 else 0
    print(f"{cls}: {acc*100:.1f}%")
```

---

## 📦 Export Optimized Model

### For Python Backend

```python
# Export to ONNX (recommended for production)
model = YOLO('runs/detect/indian_food_v2/weights/best.pt')
model.export(format='onnx', dynamic=True, simplify=True)

# Now you have: best.onnx
```

### For Mobile Deployment

```python
# Export to TensorFlow Lite
model.export(format='tflite', int8=True)  # Quantized for mobile

# Export to CoreML (iOS)
model.export(format='coreml')

# Export to NCNN (Android)
model.export(format='ncnn')
```

### Model Size Comparison

| Model | Size | Speed (FPS) | mAP50 | Use Case |
|-------|------|-------------|-------|----------|
| YOLOv8n | 6 MB | 80 | 0.82 | Mobile, real-time |
| YOLOv8s | 22 MB | 60 | 0.86 | Balanced |
| YOLOv8m | 52 MB | 40 | 0.89 | Accuracy priority |
| YOLOv8l | 88 MB | 30 | 0.91 | High accuracy |

**Recommendation**: Use **YOLOv8s** for production (good balance)

---

## 📈 Continuous Improvement

### Feedback Loop Implementation

```python
# retrain_pipeline.py
import os
from ultralytics import YOLO

# 1. Collect user-corrected images
new_images_dir = './feedback_images'

# 2. Add to Roboflow dataset
# Label and add to existing dataset

# 3. Download updated dataset
# ...

# 4. Retrain with transfer learning
model = YOLO('runs/detect/indian_food_v2/weights/best.pt')  # Start from best model
results = model.train(
    data='./indian-food-detection-2/data.yaml',  # Updated dataset
    epochs=50,  # Fewer epochs for fine-tuning
    imgsz=640,
    batch=16,
    lr0=0.001,  # Lower learning rate
    freeze=10,  # Freeze first 10 layers
    name='indian_food_v3'
)
```

### Version Control

```
runs/detect/
├── indian_food_v1/     # Initial model
├── indian_food_v2/     # Improved with better data
├── indian_food_v3/     # Fine-tuned with feedback
└── indian_food_v4/     # Production model
```

---

## ✅ Training Checklist

Before deploying model:

- [ ] mAP50 > **0.85** on test set
- [ ] Precision > **0.80** (low false positives)
- [ ] Recall > **0.75** (catches most foods)
- [ ] Tested on **50+ real thali images**
- [ ] Works on **stainless steel, banana leaf, ceramic plates**
- [ ] Handles **low-light conditions**
- [ ] No confusion between **roti/chapati/paratha**
- [ ] Correctly separates **dal/curry/sabzi**
- [ ] Detects **overlapping foods** in thalis
- [ ] Model size < **50 MB** (if deploying to mobile)
- [ ] Inference time < **200ms** on target device

---

## 🚀 Next Steps

1. Train your model using this guide
2. Export optimized model
3. Integrate with backend (see `INFERENCE_SERVICE.md`)
4. Test with nutrition mapping (see `NUTRITION_MAPPING.md`)
5. Deploy to production

**Happy Training! 🎉**
