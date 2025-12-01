# 🎯 Complete AI System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GLUCOSAGE APP                           │
│                    (React + TypeScript)                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND                              │
│                    (Express Server)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth API   │  │   Food API   │  │  Glucose API │         │
│  └──────────────┘  └──────┬───────┘  └──────────────┘         │
│                            │                                     │
│                  ┌─────────▼─────────┐                         │
│                  │  foodAIService.js │                         │
│                  └─────────┬─────────┘                         │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTP POST (multipart/form-data)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON AI BACKEND                            │
│                    (Flask Server on Port 5001)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  API Endpoints                                             ││
│  │  ───────────────                                           ││
│  │  POST /api/v1/food/detect         - YOLOv8 detection only ││
│  │  POST /api/v1/food/analyze        - Detection + Nutrition ││
│  │  POST /api/v1/glucose/predict     - XGBoost prediction    ││
│  │  POST /api/v1/food/scan-and-predict - Complete pipeline   ││
│  │  POST /api/v1/feedback            - User corrections      ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │  YOLOv8 Detection    │         │  XGBoost Prediction  │    │
│  │  ─────────────────   │         │  ──────────────────  │    │
│  │  • Load ONNX model   │         │  • Feature prep      │    │
│  │  • Detect foods      │         │  • Glucose 1h pred   │    │
│  │  • Bounding boxes    │         │  • Glucose 2h pred   │    │
│  │  • Confidence scores │         │  • Risk assessment   │    │
│  │  • Portion estimate  │         │  • Personalization   │    │
│  └──────────┬───────────┘         └──────────┬───────────┘    │
│             │                                 │                 │
│             └────────────┬────────────────────┘                 │
│                          ▼                                      │
│             ┌───────────────────────┐                          │
│             │  Nutrition Mapper     │                          │
│             │  ───────────────────  │                          │
│             │  • Load nutrition DB  │                          │
│             │  • Map foods → carbs  │                          │
│             │  • Calculate GL       │                          │
│             │  • Time adjustments   │                          │
│             │  • Generate advice    │                          │
│             └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### 1. **User Scans Food**

```
User opens camera
    ↓
Captures image
    ↓
Frontend: Sends to Node.js backend
    └─→ POST /api/food/scan
        - Multipart form with image file
        - Meal type, time of day
        - User glucose reading
```

### 2. **Backend Processing**

```
Node.js receives request
    ↓
Extracts user profile from JWT token
    ↓
Calls foodAIService.analyzeFoodImage()
    ↓
Forwards to Python AI backend
    └─→ POST http://localhost:5001/api/v1/food/scan-and-predict
        - Image file
        - Time of day
        - Last glucose reading
        - User profile (activity, diabetes type, medication)
```

### 3. **AI Processing (Python)**

```
Flask server receives image
    ↓
┌─────────────────────────┐
│ Step 1: Food Detection  │
├─────────────────────────┤
│ YOLOv8 model inference  │
│ Input: 640x640 image    │
│ Output: Bounding boxes  │
│   - roti: 0.92 conf     │
│   - dal: 0.88 conf      │
│   - rice: 0.95 conf     │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Step 2: Portion Estimate│
├─────────────────────────┤
│ Calculate box area      │
│ Map to portion size:    │
│   - Small (<8% area)    │
│   - Medium (8-20%)      │
│   - Large (>20%)        │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Step 3: Nutrition Calc  │
├─────────────────────────┤
│ Load nutrition DB       │
│ For each food:          │
│   - Get carbs/protein   │
│   - Get GI & GL         │
│   - Apply time factor   │
│ Total: 55g carbs, GL 28 │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Step 4: Glucose Predict │
├─────────────────────────┤
│ Prepare 25 features:    │
│   - Meal composition    │
│   - User factors        │
│   - Time of day         │
│ XGBoost inference:      │
│   - 1h: 145 mg/dL       │
│   - 2h: 165 mg/dL       │
│   - Risk: Moderate      │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Step 5: Generate Advice │
├─────────────────────────┤
│ If GL < 20: Low risk    │
│ If GL 20-30: Moderate   │
│ If GL > 30: High risk   │
│ Add suggestions         │
│ Time-based tips         │
└─────────────────────────┘
    ↓
Return JSON response
```

### 4. **Response to Frontend**

```javascript
{
  "success": true,
  "foods_detected": ["roti", "dal", "rice"],
  "detections": [
    {
      "item": "roti",
      "confidence": 0.92,
      "bounding_box": [120, 50, 380, 310],
      "portion_size": "medium"
    }
  ],
  "total_carbs": 55,
  "glycemic_load": 28,
  "predicted_glucose_1h": 145,
  "predicted_glucose_2h": 165,
  "risk_level": "moderate",
  "message": "Moderate impact. Consider adding protein.",
  "suggestions": [
    "Add a bowl of dal or curd",
    "Take a 10-minute walk after eating"
  ]
}
```

---

## 🔧 Technology Stack

### **Frontend**
- **Framework**: React 18 + TypeScript
- **UI**: TailwindCSS
- **Camera**: Browser MediaDevices API
- **State**: Context API
- **HTTP**: Axios

### **Backend (Node.js)**
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **File Upload**: Multer
- **HTTP Client**: Axios

### **AI Backend (Python)**
- **Framework**: Flask + Flask-CORS
- **Food Detection**: YOLOv8 (Ultralytics)
- **Glucose Prediction**: XGBoost
- **Image Processing**: OpenCV, Pillow
- **Data**: NumPy, Pandas

---

## 📂 Project Structure

```
glucosage/
├── frontend/
│   └── src/
│       ├── pages/FoodScan/
│       │   └── index.tsx          # Camera UI + Results display
│       ├── hooks/
│       │   └── useFoodScan.ts     # Food scan logic
│       └── services/
│           └── api.js              # API calls to backend
│
├── backend/
│   └── src/
│       ├── controllers/
│       │   └── foodController.js   # Food scan endpoint
│       ├── services/
│       │   └── foodAIService.js    # AI integration
│       └── models/
│           └── FoodLog.js          # MongoDB schema
│
└── ai-models/
    ├── api_server.py               # Flask API server
    ├── food-recognition/
    │   ├── food_detection_service.py
    │   ├── nutrition_database.json
    │   ├── DATASET_GUIDE.md
    │   └── TRAINING_GUIDE.md
    └── glucose-prediction/
        └── glucose_prediction_model.py
```

---

## 🚀 Deployment Guide

### **Step 1: Train YOLOv8 Model**

```bash
cd ai-models/food-recognition

# Follow DATASET_GUIDE.md to prepare data
# Follow TRAINING_GUIDE.md to train

python train.py

# Result: models/indian_food_best.pt
```

### **Step 2: Train XGBoost Model**

```bash
cd ai-models/glucose-prediction

python glucose_prediction_model.py

# Result: models/glucose_prediction_model.pkl
```

### **Step 3: Start Python AI Backend**

```bash
cd ai-models

# Install dependencies
pip install ultralytics xgboost flask flask-cors opencv-python pillow

# Set environment variables
export FOOD_MODEL_PATH="models/indian_food_best.pt"
export NUTRITION_DB_PATH="food-recognition/nutrition_database.json"
export GLUCOSE_MODEL_PATH="models/glucose_prediction_model.pkl"

# Start server
python api_server.py

# Server runs on http://localhost:5001
```

### **Step 4: Configure Node.js Backend**

```bash
cd backend

# Add to .env file
echo "AI_BACKEND_URL=http://localhost:5001" >> .env
echo "USE_MOCK_DATA=false" >> .env

# Start backend
npm run dev
```

### **Step 5: Start Frontend**

```bash
cd frontend
npm run dev
```

---

## 🧪 Testing the System

### Test 1: Health Check

```bash
curl http://localhost:5001/health
```

Expected output:
```json
{
  "status": "healthy",
  "services": {
    "food_detection": true,
    "glucose_prediction": true
  }
}
```

### Test 2: Food Detection Only

```bash
curl -X POST http://localhost:5001/api/v1/food/detect \
  -F "file=@test_image.jpg" \
  -F "conf_threshold=0.25"
```

### Test 3: Complete Pipeline

```bash
curl -X POST http://localhost:5001/api/v1/food/scan-and-predict \
  -F "file=@thali.jpg" \
  -F "time_of_day=afternoon" \
  -F "last_glucose_reading=110" \
  -F 'user_profile={"activityLevel":"moderate","diabetesType":"prediabetic"}'
```

---

## 📈 Performance Metrics

### **YOLOv8 Model**
- **Target mAP@0.5**: >0.85
- **Inference Time**: <200ms on GPU
- **Model Size**: ~22MB (YOLOv8s)
- **Classes**: 15 Indian foods

### **XGBoost Model**
- **Target MAE**: <15 mg/dL
- **Target R²**: >0.75
- **Inference Time**: <50ms
- **Features**: 25 inputs

### **End-to-End Latency**
- **Image Upload**: ~500ms
- **Food Detection**: ~200ms
- **Nutrition Calc**: ~50ms
- **Glucose Predict**: ~50ms
- **Total**: <1 second

---

## 🔄 Continuous Improvement

### Feedback Loop

```
User corrects detection
    ↓
POST /api/v1/feedback
    {
      "detected_foods": ["roti"],
      "corrected_foods": ["paratha"],
      "actual_glucose_2h": 170
    }
    ↓
Saved to feedback_data.jsonl
    ↓
Weekly retrain script
    ↓
Improved model deployed
```

### Retraining Pipeline

```python
# retrain_pipeline.py
import pandas as pd
from food_detection_service import FoodDetectionService
from glucose_prediction_model import GlucosePredictionModel

# Load feedback data
feedback = pd.read_json('feedback_data.jsonl', lines=True)

# Add to training set
# Retrain models
# Deploy new versions
```

---

## 🛡️ Error Handling

### Scenario 1: AI Backend Down

```javascript
// foodAIService.js automatically falls back to mock data
if (error) {
  console.log('Falling back to mock data...');
  return await analyzeFoodImageMock(imagePath);
}
```

### Scenario 2: No Food Detected

```python
if len(detections) == 0:
    return {
        'success': False,
        'message': 'No food items detected. Try better lighting.'
    }
```

### Scenario 3: Low Confidence

```python
if confidence < 0.40:
    # Skip this detection
    # Or flag for manual review
```

---

## 📚 Documentation Files Created

✅ **Dataset Guide**: `ai-models/food-recognition/DATASET_GUIDE.md`
✅ **Training Guide**: `ai-models/food-recognition/TRAINING_GUIDE.md`
✅ **Nutrition Database**: `ai-models/food-recognition/nutrition_database.json`
✅ **Detection Service**: `ai-models/food-recognition/food_detection_service.py`
✅ **Prediction Model**: `ai-models/glucose-prediction/glucose_prediction_model.py`
✅ **API Server**: `ai-models/api_server.py`
✅ **Backend Integration**: `backend/src/services/foodAIService.js`

---

## 🎯 Next Steps

1. **Collect Real Dataset**: Follow DATASET_GUIDE.md
2. **Train YOLOv8**: Follow TRAINING_GUIDE.md
3. **Train XGBoost**: Use real user glucose data
4. **Deploy Python Backend**: Host on cloud (AWS/GCP)
5. **Update Frontend**: Integrate camera with API
6. **Test End-to-End**: Validate full pipeline
7. **Launch Feedback Loop**: Collect user corrections
8. **Monitor & Improve**: Weekly retraining

---

**System Status**: ✅ Ready for Training and Deployment
**Estimated Setup Time**: 2-3 weeks for full deployment
**Required Skills**: Python, Machine Learning, React, Node.js
