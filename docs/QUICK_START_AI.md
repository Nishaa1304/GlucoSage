# 🚀 Quick Start Guide - AI Food Recognition System

## Overview
This guide will help you set up the complete Indian food recognition and glucose prediction system.

---

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- GPU recommended (NVIDIA with CUDA) for training, optional for inference
- 8GB+ RAM
- 10GB+ free disk space

---

## Step-by-Step Setup

### 1️⃣ **Install Python Dependencies**

```bash
cd ai-models
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed ultralytics-8.0.196 xgboost-2.0.3 ...
```

---

### 2️⃣ **Download Pretrained YOLOv8 Weights (Optional)**

```bash
# Download base model for transfer learning
python -c "from ultralytics import YOLO; YOLO('yolov8s.pt')"
```

**Or train from scratch (see Training section below)**

---

### 3️⃣ **Test AI Services Individually**

#### Test Food Detection Service:

```bash
cd food-recognition
python
```

```python
from food_detection_service import FoodDetectionService

# Initialize service
service = FoodDetectionService(
    model_path='yolov8s.pt',  # Use pretrained for testing
    nutrition_db_path='nutrition_database.json'
)

# Test with sample image
result = service.process_image(
    'test_image.jpg',
    time_of_day='afternoon'
)

print(result)
```

#### Test Glucose Prediction Model:

```bash
cd ../glucose-prediction
python glucose_prediction_model.py
```

**Expected output:**
```
✅ Generated 2000 samples → training_data.csv
🎓 Training prediction models...
✅ 1-Hour Model Performance: MAE: 12.45 mg/dL, R²: 0.812
✅ 2-Hour Model Performance: MAE: 14.23 mg/dL, R²: 0.789
✅ Models saved to: glucose_prediction_model.pkl
```

---

### 4️⃣ **Start Python AI Backend**

```bash
cd ai-models

# Option A: Use mock models for testing
python api_server.py
```

You should see:
```
✅ Model loaded: models/indian_food_best.pt
✅ Nutrition database loaded
✅ Glucose prediction model initialized
🚀 Starting Flask API server...
 * Running on http://0.0.0.0:5001
```

**Test the health endpoint:**
```bash
curl http://localhost:5001/health
```

---

### 5️⃣ **Configure Node.js Backend**

```bash
cd backend

# Install dependencies
npm install axios form-data

# Update .env
echo "AI_BACKEND_URL=http://localhost:5001" >> .env
echo "USE_MOCK_DATA=false" >> .env  # Set to true if AI backend not ready
```

---

### 6️⃣ **Start Node.js Backend**

```bash
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

---

### 7️⃣ **Start Frontend**

```bash
cd frontend
npm run dev
```

Open browser: `http://localhost:5173`

---

## 🎓 Training Your Own Models

### **YOLOv8 Food Recognition Model**

#### Step 1: Prepare Dataset

Follow: `ai-models/food-recognition/DATASET_GUIDE.md`

Key points:
- Collect 300+ images per food class
- Use Roboflow for labeling
- Export in YOLOv8 format

#### Step 2: Train Model

```bash
cd ai-models/food-recognition

# Create training script
cat > train_model.py << 'EOF'
from ultralytics import YOLO

model = YOLO('yolov8s.pt')

results = model.train(
    data='./indian-food-dataset/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0,  # Use GPU
    patience=20,
    name='indian_food_v1'
)

print(f"Training complete! Best model: runs/detect/indian_food_v1/weights/best.pt")
EOF

# Run training
python train_model.py
```

**Training time:** ~2-4 hours on GPU (depends on dataset size)

#### Step 3: Export Model

```python
from ultralytics import YOLO

model = YOLO('runs/detect/indian_food_v1/weights/best.pt')
model.export(format='onnx')  # For production deployment
```

---

### **XGBoost Glucose Prediction Model**

#### Step 1: Collect User Data

Create CSV with real user data:

```csv
total_carbs,total_protein,glycemic_load,baseline_glucose,...,glucose_1h,glucose_2h
55,18,28,110,...,145,165
72,28,35,105,...,178,192
...
```

Required columns:
- Meal composition (carbs, protein, fat, fiber, GL)
- User factors (activity level, diabetes type, medication)
- Time factors (hour, time since last meal)
- Outcomes (actual glucose at 1h and 2h)

#### Step 2: Train Model

```bash
cd ai-models/glucose-prediction

python
```

```python
from glucose_prediction_model import GlucosePredictionModel

# Train on real data
model = GlucosePredictionModel()
metrics = model.train('real_user_data.csv')

# Save trained model
model.save_model('glucose_prediction_model.pkl')
```

**Expected performance:**
- MAE < 15 mg/dL
- R² > 0.75

---

## 📱 Testing the Full System

### Test 1: Upload Food Image via API

```bash
# Take a photo of Indian food and save as 'meal.jpg'

curl -X POST http://localhost:5000/api/food/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@meal.jpg" \
  -F "mealType=lunch"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "detectedItems": [
      {"name": "Roti", "confidence": 0.92},
      {"name": "Dal", "confidence": 0.88}
    ],
    "nutrition": {
      "carbs": 55,
      "glycemicLoad": "Medium"
    },
    "sugarImpact": {
      "prediction": "Moderate rise expected",
      "glucose1h": 145,
      "glucose2h": 165
    }
  }
}
```

### Test 2: Frontend Food Scan

1. Open app: `http://localhost:5173`
2. Login/Register
3. Navigate to "Food Scan" page
4. Click camera icon
5. Take photo of food
6. View results with:
   - Detected foods
   - Nutrition breakdown
   - Glucose prediction
   - Personalized advice

---

## 🐛 Troubleshooting

### Issue: Python AI backend fails to start

**Error:** `ModuleNotFoundError: No module named 'ultralytics'`

**Solution:**
```bash
pip install -r requirements.txt
```

---

### Issue: "No module named 'flask_cors'"

**Solution:**
```bash
pip install flask-cors
```

---

### Issue: YOLOv8 model not found

**Error:** `FileNotFoundError: models/indian_food_best.pt`

**Solution:**
```bash
# Use pretrained YOLOv8 for testing
export FOOD_MODEL_PATH="yolov8s.pt"
python api_server.py
```

Or train your own model (see Training section)

---

### Issue: Node.js backend can't connect to Python backend

**Error:** `ECONNREFUSED 127.0.0.1:5001`

**Solution:**
1. Ensure Python AI backend is running:
```bash
curl http://localhost:5001/health
```

2. If not running, start it:
```bash
cd ai-models
python api_server.py
```

3. Or enable mock mode:
```bash
# In backend/.env
USE_MOCK_DATA=true
```

---

### Issue: CORS errors in browser

**Solution:**
Ensure Flask CORS is enabled in `api_server.py`:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This should be present
```

---

## 📊 Performance Optimization

### For Production Deployment:

1. **Use ONNX Runtime** for faster inference:
```python
model.export(format='onnx')
# Then use onnxruntime instead of pytorch
```

2. **Enable GPU acceleration**:
```python
model = YOLO('model.pt')
model.to('cuda')  # Use GPU
```

3. **Batch processing** for multiple images:
```python
results = model.predict(['img1.jpg', 'img2.jpg'], batch=4)
```

4. **Reduce image size** for mobile:
```python
model.predict(image, imgsz=416)  # Smaller than 640
```

---

## 🔄 Updating Models

### Deploy New YOLOv8 Model:

```bash
# 1. Train new model
python train_model.py

# 2. Test locally
python test_model.py

# 3. Replace production model
cp runs/detect/indian_food_v2/weights/best.pt models/indian_food_best.pt

# 4. Restart AI backend
# The server will automatically load the new model
```

### Deploy New XGBoost Model:

```bash
# 1. Retrain with new data
python retrain_glucose_model.py

# 2. Replace production model
cp new_model.pkl glucose_prediction_model.pkl

# 3. Restart AI backend
```

---

## 📈 Monitoring

### Check Model Performance:

```bash
# View training logs
cat runs/detect/indian_food_v1/results.csv

# View feature importance
python -c "
from glucose_prediction_model import GlucosePredictionModel
model = GlucosePredictionModel('glucose_prediction_model.pkl')
print(model.feature_importance)
"
```

### Monitor API Latency:

```bash
# Time full pipeline
time curl -X POST http://localhost:5001/api/v1/food/scan-and-predict \
  -F "file=@test.jpg"
```

---

## ✅ Checklist

Before going to production:

- [ ] YOLOv8 model trained on real Indian food dataset
- [ ] mAP@0.5 > 0.85 on test set
- [ ] XGBoost model trained on real user glucose data
- [ ] MAE < 15 mg/dL on validation set
- [ ] Python AI backend tested with 100+ images
- [ ] Node.js backend integration tested
- [ ] Frontend camera integration working
- [ ] Error handling for all edge cases
- [ ] Feedback loop mechanism implemented
- [ ] Performance metrics monitored
- [ ] Models versioned and backed up

---

## 🆘 Getting Help

- **Dataset questions**: See `DATASET_GUIDE.md`
- **Training issues**: See `TRAINING_GUIDE.md`
- **Architecture**: See `AI_SYSTEM_ARCHITECTURE.md`
- **API reference**: See Flask `/health` endpoint for service status

---

**Ready to build the future of glucose management! 🚀**
