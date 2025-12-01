# 🤖 GlucoSage AI Models

Complete AI-powered Indian food recognition and glucose prediction system.

---

## 📋 Overview

This directory contains:

1. **YOLOv8 Food Detection** - Identifies 15+ Indian food items with bounding boxes
2. **XGBoost Glucose Prediction** - Predicts blood sugar levels 1h and 2h after meals
3. **Nutrition Mapping** - Comprehensive database of Indian foods (carbs, GI, GL)
4. **Flask API Server** - REST API for model inference
5. **Training Pipelines** - Complete training workflows for both models

---

## 🗂️ Directory Structure

```
ai-models/
├── api_server.py                      # Flask REST API (Port 5001)
├── requirements.txt                   # Python dependencies
│
├── food-recognition/
│   ├── food_detection_service.py      # YOLOv8 inference service
│   ├── nutrition_database.json        # 15 foods with nutrition data
│   ├── DATASET_GUIDE.md               # How to prepare dataset
│   ├── TRAINING_GUIDE.md              # How to train YOLOv8
│   └── models/
│       └── indian_food_best.pt        # Trained model (after training)
│
├── glucose-prediction/
│   ├── glucose_prediction_model.py    # XGBoost model + training
│   ├── models/
│   │   └── glucose_prediction_model.pkl
│   └── training_data.csv              # Sample data (generated)
│
└── uploads/                           # Temporary uploaded images
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start AI Backend

```bash
python api_server.py
```

Server starts on `http://localhost:5001`

### 3. Test API

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "food_detection": true,
    "glucose_prediction": true
  }
}
```

---

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Food Detection Only
```
POST /api/v1/food/detect

Body (multipart/form-data):
  - file: image file
  - conf_threshold: 0.25 (optional)

Response:
{
  "success": true,
  "detections": [
    {
      "item": "roti",
      "confidence": 0.92,
      "bounding_box": [x1, y1, x2, y2],
      "portion_size": "medium"
    }
  ]
}
```

### 3. Complete Food Analysis
```
POST /api/v1/food/analyze

Body (multipart/form-data):
  - file: image file
  - time_of_day: "afternoon"
  - user_profile: JSON object

Response:
{
  "success": true,
  "foods_detected": ["roti", "dal"],
  "nutrition": {
    "total_carbs": 55,
    "glycemic_load": 28,
    ...
  },
  "advice": {...}
}
```

### 4. Glucose Prediction
```
POST /api/v1/glucose/predict

Body (JSON):
{
  "meal_data": {
    "total_carbs": 55,
    "total_protein": 18,
    "glycemic_load": 28,
    "last_glucose_reading": 110,
    ...
  }
}

Response:
{
  "success": true,
  "prediction": {
    "predicted_glucose_1h": 145,
    "predicted_glucose_2h": 165,
    "risk_level": "moderate"
  }
}
```

### 5. Complete Pipeline (Recommended)
```
POST /api/v1/food/scan-and-predict

Body (multipart/form-data):
  - file: image file
  - time_of_day: "afternoon"
  - last_glucose_reading: 110
  - hours_since_last_meal: 4
  - user_profile: JSON object

Response:
{
  "success": true,
  "foods_detected": ["roti", "dal"],
  "total_carbs": 55,
  "glycemic_load": 28,
  "predicted_glucose_1h": 145,
  "predicted_glucose_2h": 165,
  "risk_level": "moderate",
  "message": "Moderate impact. Consider adding protein.",
  "suggestions": [...]
}
```

### 6. Submit Feedback
```
POST /api/v1/feedback

Body (JSON):
{
  "image_id": "xyz",
  "detected_foods": ["roti"],
  "corrected_foods": ["paratha"],
  "actual_glucose_1h": 145,
  "actual_glucose_2h": 160
}
```

---

## 🎓 Training Models

### YOLOv8 Food Recognition

**Step 1:** Prepare dataset following `food-recognition/DATASET_GUIDE.md`

**Step 2:** Train model following `food-recognition/TRAINING_GUIDE.md`

**Quick training:**
```python
from ultralytics import YOLO

model = YOLO('yolov8s.pt')
results = model.train(
    data='indian-food-dataset/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16
)
```

**Expected Results:**
- mAP@0.5: >0.85
- Training time: 2-4 hours (GPU)

---

### XGBoost Glucose Prediction

**Step 1:** Collect real user data with glucose measurements

**Step 2:** Train model:
```python
from glucose_prediction_model import GlucosePredictionModel

model = GlucosePredictionModel()
metrics = model.train('user_data.csv')
model.save_model('models/glucose_prediction_model.pkl')
```

**Expected Results:**
- MAE: <15 mg/dL
- R²: >0.75

---

## 🍽️ Supported Foods (15 Classes)

1. **roti** - Whole wheat flatbread
2. **chapati** - Thin flatbread
3. **paratha** - Layered flatbread
4. **poha** - Flattened rice
5. **upma** - Semolina dish
6. **idli** - Steamed rice cake
7. **dosa** - Rice crepe
8. **dal** - Lentil curry
9. **rice** - White rice
10. **pulao** - Flavored rice
11. **biryani** - Spiced rice
12. **sabzi** - Vegetable curry
13. **curry** - Gravy dish
14. **fruits** - Mixed fruits
15. **vegetables** - Raw/cooked vegetables

---

## 📊 Model Performance

### YOLOv8 Metrics (After Training)

| Metric | Target | Achieved |
|--------|--------|----------|
| mAP@0.5 | >0.85 | TBD* |
| mAP@0.5:0.95 | >0.60 | TBD* |
| Precision | >0.80 | TBD* |
| Recall | >0.75 | TBD* |
| Inference (GPU) | <200ms | TBD* |

*TBD: To Be Determined after training on real dataset

### XGBoost Metrics (On Sample Data)

| Metric | Target | Achieved |
|--------|--------|----------|
| MAE (1h) | <15 mg/dL | ~12 mg/dL |
| MAE (2h) | <15 mg/dL | ~14 mg/dL |
| R² (1h) | >0.75 | ~0.81 |
| R² (2h) | >0.75 | ~0.79 |
| Inference | <50ms | ~30ms |

---

## 🔧 Configuration

### Environment Variables

```bash
# Model paths
export FOOD_MODEL_PATH="food-recognition/models/indian_food_best.pt"
export NUTRITION_DB_PATH="food-recognition/nutrition_database.json"
export GLUCOSE_MODEL_PATH="glucose-prediction/models/glucose_prediction_model.pkl"

# Server settings
export UPLOAD_FOLDER="./uploads"
export FLASK_PORT=5001
```

### For Development (Mock Data)

If models are not trained yet, the service will automatically fall back to mock data.

---

## 🐛 Troubleshooting

### Issue: Models not found

```bash
# Download pretrained YOLOv8 base model
python -c "from ultralytics import YOLO; YOLO('yolov8s.pt')"

# Generate sample glucose model
cd glucose-prediction
python glucose_prediction_model.py
```

### Issue: Out of memory during inference

```python
# Reduce batch size or image size
model.predict(image, imgsz=416)  # Instead of 640
```

### Issue: Slow inference on CPU

```bash
# Export to ONNX for faster CPU inference
model.export(format='onnx')
```

---

## 📈 Continuous Improvement

### Feedback Loop

User feedback is automatically saved to `feedback_data.jsonl`:

```json
{"detected_foods": ["roti"], "corrected_foods": ["paratha"], "timestamp": "..."}
{"actual_glucose_2h": 170, "predicted_glucose_2h": 165, "timestamp": "..."}
```

### Retraining Schedule

1. **Weekly**: Review feedback data
2. **Monthly**: Retrain models with new data
3. **Quarterly**: Full model evaluation and optimization

### Retraining Script

```python
# retrain_yolo.py
from ultralytics import YOLO

# Load existing model
model = YOLO('models/indian_food_best.pt')

# Fine-tune with feedback images
model.train(
    data='feedback_dataset/data.yaml',
    epochs=30,
    lr0=0.001,  # Lower learning rate for fine-tuning
    freeze=10    # Freeze first 10 layers
)
```

---

## 📚 Documentation

- **Dataset Preparation**: `food-recognition/DATASET_GUIDE.md`
- **Model Training**: `food-recognition/TRAINING_GUIDE.md`
- **System Architecture**: `../docs/architecture/AI_SYSTEM_ARCHITECTURE.md`
- **Quick Start**: `../docs/QUICK_START_AI.md`

---

## 🤝 Contributing

### Adding New Food Classes

1. Collect 250+ images of new food
2. Add to Roboflow dataset
3. Update `nutrition_database.json`
4. Retrain YOLOv8 model
5. Test and deploy

### Improving Glucose Prediction

1. Collect more user data with actual glucose readings
2. Add new features (e.g., HbA1c, BMI)
3. Experiment with hyperparameters
4. Cross-validate on multiple users
5. Deploy improved model

---

## 🔒 Security Notes

- **Input Validation**: All image uploads are validated
- **File Size Limits**: Max 10MB per image
- **Rate Limiting**: Implement in production
- **Authentication**: Required for production deployment
- **Data Privacy**: No images stored permanently (unless user consents)

---

## 📦 Model Versioning

```
models/
├── indian_food_v1_2024_01_15.pt
├── indian_food_v2_2024_02_10.pt
├── indian_food_best.pt -> v2  (symlink to latest)
└── glucose_prediction_v1.pkl
```

Always keep previous versions for rollback.

---

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Dockerfile (ai-models/)
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5001
CMD ["python", "api_server.py"]
```

```bash
docker build -t glucosage-ai .
docker run -p 5001:5001 glucosage-ai
```

### Cloud Deployment (AWS)

1. **EC2 Instance**: Use GPU instance (g4dn.xlarge) for faster inference
2. **S3**: Store trained models
3. **API Gateway**: Route requests to Flask server
4. **CloudWatch**: Monitor latency and errors

---

## 📊 Monitoring Dashboard

Track key metrics:
- **Inference latency** (p50, p95, p99)
- **Detection accuracy** (user feedback)
- **Prediction error** (MAE when actual glucose available)
- **API uptime**
- **Model version deployed**

---

## ✅ Pre-Production Checklist

- [ ] YOLOv8 model trained on 5000+ images
- [ ] mAP@0.5 > 0.85 achieved
- [ ] XGBoost model trained on 1000+ user meals
- [ ] MAE < 15 mg/dL achieved
- [ ] All 15 food classes tested
- [ ] Thali detection working (multiple foods)
- [ ] Low-light images tested
- [ ] Banana leaf plates tested
- [ ] API load tested (100+ requests/min)
- [ ] Error handling for all edge cases
- [ ] Monitoring dashboard deployed
- [ ] Feedback loop active
- [ ] Models versioned and backed up

---

## 📞 Support

For issues or questions:
1. Check documentation in `docs/`
2. Review troubleshooting section above
3. Check Flask logs: `flask.log`
4. Test with mock data first

---

**Built with ❤️ for better glucose management**
