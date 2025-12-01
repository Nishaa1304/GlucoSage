 # 🛠️ Python Environment Setup for AI Training

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- 8GB+ RAM
- 20GB+ free disk space
- GPU (optional, but recommended for training)

---

## 🚀 Quick Setup

### Step 1: Check Python Version

```powershell
python --version
```

**Expected:** Python 3.8.x or higher

If not installed:
- Download from [python.org](https://python.org)
- Install with "Add to PATH" checked

---

### Step 2: Create Virtual Environment (Recommended)

```powershell
# Navigate to ai-models folder
cd d:\Yukti\glucosage\ai-models

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1
```

**You should see:** `(venv)` prefix in terminal

---

### Step 3: Install Dependencies

```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt
```

**This will install:**
- ultralytics (YOLOv8)
- torch, torchvision (PyTorch)
- opencv-python (Computer Vision)
- pillow (Image processing)
- numpy, pandas (Data processing)
- flask, flask-cors (API server)
- xgboost, scikit-learn (ML models)
- And more...

**Installation time:** 5-10 minutes

---

### Step 4: Verify Installation

```powershell
# Check YOLOv8
python -c "from ultralytics import YOLO; print('YOLOv8 OK')"

# Check PyTorch
python -c "import torch; print(f'PyTorch OK - GPU: {torch.cuda.is_available()}')"

# Check other packages
python -c "import cv2, PIL, numpy, pandas, flask, xgboost; print('All packages OK')"
```

**Expected output:**
```
YOLOv8 OK
PyTorch OK - GPU: True (or False if no GPU)
All packages OK
```

---

## 🎮 GPU Setup (Optional but Recommended)

### If you have NVIDIA GPU:

1. **Check GPU:**
   ```powershell
   nvidia-smi
   ```

2. **Install CUDA Toolkit:**
   - Download: [CUDA 11.8](https://developer.nvidia.com/cuda-downloads)
   - Install
   - Reboot

3. **Verify GPU in PyTorch:**
   ```powershell
   python -c "import torch; print(torch.cuda.get_device_name(0))"
   ```

**With GPU:**
- Training: 10× faster
- Cost: Lower (less cloud compute)

**Without GPU:**
- Still works!
- Training: Slower
- Option: Use Google Colab (free GPU)

---

## 📦 What's Installed?

### Core ML Libraries:
```
ultralytics==8.0.196     # YOLOv8 object detection
torch==2.0.1             # PyTorch deep learning
torchvision==0.15.2      # Vision models
```

### Computer Vision:
```
opencv-python==4.8.0     # Image processing
pillow==10.0.0           # Image handling
```

### Data Science:
```
numpy==1.24.3            # Arrays
pandas==2.0.3            # DataFrames
scikit-learn==1.3.0      # ML utilities
xgboost==1.7.6           # Gradient boosting
```

### API Server:
```
flask==2.3.2             # Web framework
flask-cors==4.0.0        # CORS handling
```

### Utilities:
```
requests==2.31.0         # HTTP requests
pyyaml==6.0              # Config files
tqdm==4.65.0             # Progress bars
```

---

## ✅ Environment Test Script

Save this as `test_environment.py` and run it:

```python
#!/usr/bin/env python3
"""Test AI environment setup"""

import sys
from pathlib import Path

def test_environment():
    print("🔍 Testing AI Environment...")
    print()
    
    # Python version
    print(f"✅ Python: {sys.version.split()[0]}")
    
    # Test imports
    packages = [
        ('ultralytics', 'YOLOv8'),
        ('torch', 'PyTorch'),
        ('cv2', 'OpenCV'),
        ('PIL', 'Pillow'),
        ('numpy', 'NumPy'),
        ('pandas', 'Pandas'),
        ('sklearn', 'Scikit-learn'),
        ('xgboost', 'XGBoost'),
        ('flask', 'Flask'),
    ]
    
    failed = []
    for module, name in packages:
        try:
            __import__(module)
            version = __import__(module).__version__ if hasattr(__import__(module), '__version__') else 'OK'
            print(f"✅ {name:15s} {version}")
        except ImportError:
            print(f"❌ {name:15s} NOT INSTALLED")
            failed.append(name)
    
    print()
    
    # GPU check
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
            print(f"   CUDA: {torch.version.cuda}")
        else:
            print("⚠️  GPU: Not available (CPU only)")
    except:
        pass
    
    print()
    
    if failed:
        print(f"❌ Missing: {', '.join(failed)}")
        print("Run: pip install -r requirements.txt")
        return False
    else:
        print("🎉 All packages installed correctly!")
        print("✅ Ready to train!")
        return True

if __name__ == '__main__':
    success = test_environment()
    sys.exit(0 if success else 1)
```

**Run it:**
```powershell
python test_environment.py
```

---

## 🚨 Troubleshooting

### Issue 1: "pip not found"
```powershell
# Fix:
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

### Issue 2: "torch installation fails"
```powershell
# Install CPU-only version (if no GPU):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Or for GPU (CUDA 11.8):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Issue 3: "Permission denied"
```powershell
# Run PowerShell as Administrator
# Or use --user flag:
pip install --user -r requirements.txt
```

### Issue 4: "Module not found after install"
```powershell
# Ensure you're in virtual environment:
.\venv\Scripts\Activate.ps1

# Check where pip is installing:
pip --version

# Should show path inside venv folder
```

### Issue 5: "Out of memory during training"
**Solutions:**
- Reduce batch size (edit training script)
- Use smaller image size (512 instead of 640)
- Close other programs
- Add swap space
- Use cloud GPU (Colab, Kaggle)

---

## 📊 Disk Space Check

```powershell
# Check available space
Get-PSDrive D | Select-Object Name, @{Name="Free(GB)"; Expression={[math]::Round($_.Free / 1GB, 2)}}
```

**Requirements:**
- Dependencies: ~5GB
- Dataset: ~5GB
- Training outputs: ~5GB
- Buffer: ~5GB
**Total: ~20GB**

---

## 🌐 Alternative: Google Colab (Free GPU!)

If your PC is slow or lacks GPU:

1. **Upload dataset to Google Drive**

2. **Create Colab notebook:**
   - Go to [colab.research.google.com](https://colab.research.google.com)
   - Runtime → Change runtime type → GPU (T4)

3. **Mount Drive & Install:**
   ```python
   from google.colab import drive
   drive.mount('/content/drive')
   
   !pip install ultralytics
   ```

4. **Run training from Colab**

**Pros:**
- Free GPU (T4, 15GB RAM)
- Fast training
- No local setup needed

**Cons:**
- Session timeout (12 hours)
- Need internet
- Data upload time

---

## ✅ Setup Checklist

Before starting training:

- [ ] Python 3.8+ installed
- [ ] Virtual environment created & activated
- [ ] requirements.txt installed
- [ ] All packages import successfully
- [ ] GPU detected (or Colab ready)
- [ ] Dataset folders created
- [ ] 20GB+ free disk space

---

## 🎯 Next Steps

Once environment is ready:

1. ✅ Collect images (follow IMAGE_COLLECTION_GUIDE.md)
2. ✅ Upload & label in Roboflow
3. ✅ Export dataset
4. ✅ Run training (TRAINING_GUIDE.md)

---

## 💡 Pro Tips

**Tip 1: Always activate venv**
```powershell
# Add to your daily routine:
cd d:\Yukti\glucosage\ai-models
.\venv\Scripts\Activate.ps1
```

**Tip 2: Keep packages updated**
```powershell
pip install --upgrade ultralytics torch
```

**Tip 3: Save your environment**
```powershell
pip freeze > requirements_freeze.txt
```

**Tip 4: Use Jupyter for experiments**
```powershell
pip install jupyter
jupyter notebook
```

---

## 📞 Need Help?

- **PyTorch:** [pytorch.org/get-started](https://pytorch.org/get-started)
- **Ultralytics:** [docs.ultralytics.com](https://docs.ultralytics.com)
- **Our docs:** Check other guides in this folder

---

**Ready? Let's build this! 🚀**
