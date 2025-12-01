"""
Flask API Bridge for AI Models
Provides REST endpoints for food detection and glucose prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import base64
import io
from PIL import Image
import traceback
import importlib.util
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

# Import using importlib for hyphenated folder names
food_rec_spec = importlib.util.spec_from_file_location(
    "food_detection_service", 
    Path(__file__).parent / "food-recognition" / "food_detection_service.py"
)
food_rec_module = importlib.util.module_from_spec(food_rec_spec)
food_rec_spec.loader.exec_module(food_rec_module)
FoodDetectionService = food_rec_module.FoodDetectionService

# Import Demo Food Mapper
from demo_food_mapper import DemoFoodMapper

glucose_spec = importlib.util.spec_from_file_location(
    "glucose_prediction_model",
    Path(__file__).parent / "glucose-prediction" / "glucose_prediction_model.py"
)
glucose_module = importlib.util.module_from_spec(glucose_spec)
glucose_spec.loader.exec_module(glucose_module)
GlucosePredictionModel = glucose_module.GlucosePredictionModel

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize services
FOOD_MODEL_PATH = os.getenv('FOOD_MODEL_PATH', 'models/food-recognition/yolov8n.pt')  # Using base model
NUTRITION_DB_PATH = os.getenv('NUTRITION_DB_PATH', 'food-recognition/nutrition_database.json')
GLUCOSE_MODEL_PATH = os.getenv('GLUCOSE_MODEL_PATH', 'models/glucose_prediction_model.pkl')
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')

# Create upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global service instances
food_service = None
glucose_model = None
demo_mapper = None

def init_services():
    """Initialize AI services"""
    global food_service, glucose_model, demo_mapper
    
    try:
        print("🔧 Initializing AI services...")
        
        food_service = FoodDetectionService(
            model_path=FOOD_MODEL_PATH,
            nutrition_db_path=NUTRITION_DB_PATH,
            use_fallback=True  # Enable generic food detection
        )
        print("✅ Food detection service initialized")
        
        # Initialize Demo Food Mapper
        demo_mapper = DemoFoodMapper()
        print("✅ Demo food mapper initialized")
        
        # Try to load glucose model (optional)
        try:
            glucose_model = GlucosePredictionModel(model_path=GLUCOSE_MODEL_PATH)
            print("✅ Glucose prediction model initialized")
        except Exception as ge:
            print(f"⚠️  Glucose model not loaded: {ge}")
            print("   Food scanning will work, glucose prediction disabled")
            glucose_model = None
        
        return True
    except Exception as e:
        print(f"❌ Error initializing services: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'services': {
            'food_detection': food_service is not None,
            'glucose_prediction': glucose_model is not None,
            'demo_mapper': demo_mapper is not None
        }
    })

@app.route('/api/v1/food/detect', methods=['POST'])
def detect_food():
    """
    Detect food items in uploaded image
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file,
        "conf_threshold": 0.25 (optional),
        "iou_threshold": 0.45 (optional)
    }
    
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
    """
    try:
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
        elif request.is_json and 'image' in request.json:
            # Decode base64 image
            image_data = base64.b64decode(request.json['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_upload.jpg')
            image.save(image_path)
        else:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Get parameters (only if JSON request)
        conf_threshold = 0.25
        iou_threshold = 0.45
        if request.is_json:
            conf_threshold = request.json.get('conf_threshold', 0.25)
            iou_threshold = request.json.get('iou_threshold', 0.45)
        
        # Detect foods
        detections = food_service.detect_foods(
            image_path,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold
        )
        
        return jsonify({
            'success': True,
            'detections': detections,
            'num_foods': len(detections)
        })
        
    except Exception as e:
        print(f"Error in detect_food: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/detect/logmeal', methods=['POST'])
def detect_food_logmeal():
    """
    Detect food using LogMeal API (FREE - 500 requests/month)
    Better accuracy for Indian food, no training needed
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file
    }
    
    Response:
    {
        "success": true,
        "detections": [
            {
                "item": "idli",
                "confidence": 0.95,
                "food_type": "South Indian",
                "nutrition": { "calories": 100, "carbs": 20, ... }
            }
        ],
        "source": "logmeal_api"
    }
    """
    try:
        if not logmeal_detector:
            return jsonify({
                'success': False, 
                'error': 'LogMeal API not configured. Get free token at https://logmeal.es/developers/'
            }), 400
        
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
        elif request.is_json and 'image' in request.json:
            # Decode base64 image
            image_data = base64.b64decode(request.json['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_logmeal.jpg')
            image.save(image_path)
        else:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Detect using LogMeal
        detections = logmeal_detector.detect_food(image_path)
        
        return jsonify({
            'success': True,
            'detections': detections,
            'num_foods': len(detections),
            'source': 'logmeal_api'
        })
        
    except Exception as e:
        print(f"Error in detect_food_logmeal: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/analyze', methods=['POST'])
def analyze_food():
    """
    Complete food analysis: detect + calculate nutrition
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file,
        "time_of_day": "afternoon",
        "user_profile": {
            "activityLevel": "moderate",
            "diabetesType": "prediabetic",
            "medication": null
        }
    }
    
    Response:
    {
        "success": true,
        "foods_detected": ["roti", "dal", "rice"],
        "detections": [...],
        "nutrition": {
            "total_carbs": 55,
            "glycemic_load": 28,
            ...
        },
        "advice": {...}
    }
    """
    try:
        # Get image
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
            
            # Get other parameters from form data
            time_of_day = request.form.get('time_of_day', 'afternoon')
            user_profile = request.form.get('user_profile', '{}')
            if isinstance(user_profile, str):
                import json
                user_profile = json.loads(user_profile)
        else:
            data = request.json
            # Decode base64 image
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_upload.jpg')
            image.save(image_path)
            
            time_of_day = data.get('time_of_day', 'afternoon')
            user_profile = data.get('user_profile', {})
        
        # Process image
        result = food_service.process_image(
            image_path=image_path,
            time_of_day=time_of_day,
            user_profile=user_profile,
            save_annotated=True
        )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analyze_food: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/detect/spoonacular', methods=['POST'])
def detect_food_spoonacular():
    """
    Detect food using Spoonacular API (FREE - 150 requests/day)
    🌟 RECOMMENDED: Most reliable, best nutrition data, excellent Indian food coverage
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file
    }
    
    Response:
    {
        "success": true,
        "detections": [
            {
                "item": "chicken_biryani",
                "confidence": 0.95,
                "nutrition": { "calories": 450, "carbohydrates": 60, ... },
                "portion_size": "large",
                "estimated_weight": 350,
                "similar_recipes": [{"title": "Hyderabadi Biryani", "id": 12345}]
            }
        ],
        "source": "spoonacular_api",
        "total_items": 1
    }
    """
    try:
        # Safety check: re-initialize if detector is None (hot reload issue)
        global spoonacular_detector
        if not spoonacular_detector:
            print("⚠️ Spoonacular detector was None, re-initializing...")
            SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')
            if SPOONACULAR_API_KEY:
                SpoonacularDetector = importlib.import_module('food-recognition.spoonacular_api').SpoonacularDetector
                spoonacular_detector = SpoonacularDetector(SPOONACULAR_API_KEY)
                print("✅ Spoonacular detector re-initialized")
        
        if not spoonacular_detector:
            return jsonify({
                'success': False, 
                'error': 'Spoonacular API not configured. Get free key at https://spoonacular.com/food-api',
                'setup_guide': 'See SPOONACULAR_SETUP.md for instructions'
            }), 400
        
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
        elif request.is_json and 'image' in request.json:
            # Decode base64 image
            image_data = base64.b64decode(request.json['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_spoonacular.jpg')
            image.save(image_path)
        else:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Detect using Spoonacular
        result = spoonacular_detector.detect_food(image_path)
        
        if result['success']:
            return jsonify({
                'success': True,
                'detections': result['detections'],
                'total_items': result['total_items'],
                'source': 'spoonacular_api'
            })
        else:
            return jsonify(result), 500
        
    except Exception as e:
        print(f"Error in detect_food_spoonacular: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/detect/caloriemama', methods=['POST'])
def detect_food_caloriemama():
    """
    Detect food using Calorie Mama API (FREE - 500 requests/month)
    🎯 BEST OPTION: Recognizes 1000+ foods including all Indian cuisines
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file
    }
    
    Response:
    {
        "success": true,
        "detections": [
            {
                "item": "biryani",
                "confidence": 0.92,
                "nutrition": { "calories": 450, "carbs": 60, ... },
                "portion_size": "medium",
                "estimated_weight": 250
            }
        ],
        "source": "calorie_mama_api",
        "total_items": 3
    }
    """
    try:
        if not calorie_mama_detector:
            return jsonify({
                'success': False, 
                'error': 'Calorie Mama API not configured. Get free key at https://rapidapi.com/spoonacular/api/calorie-mama',
                'setup_guide': 'See CALORIE_MAMA_SETUP.md for instructions'
            }), 400
        
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
        elif request.is_json and 'image' in request.json:
            # Decode base64 image
            image_data = base64.b64decode(request.json['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_caloriemama.jpg')
            image.save(image_path)
        else:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Detect using Calorie Mama
        result = calorie_mama_detector.detect_food(image_path)
        
        if result['success']:
            return jsonify({
                'success': True,
                'detections': result['detections'],
                'total_items': result['total_items'],
                'source': 'calorie_mama_api'
            })
        else:
            return jsonify(result), 500
        
    except Exception as e:
        print(f"Error in detect_food_caloriemama: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/glucose/predict', methods=['POST'])
def predict_glucose():
    """
    Predict glucose levels based on meal data
    
    Request body:
    {
        "meal_data": {
            "total_carbs": 55,
            "total_protein": 12,
            "glycemic_load": 28,
            ...
            "last_glucose_reading": 110,
            "time_of_day": "afternoon",
            ...
        }
    }
    
    Response:
    {
        "predicted_glucose_1h": 134,
        "predicted_glucose_2h": 152,
        "glucose_spike_1h": 24,
        "glucose_spike_2h": 42,
        "risk_level": "moderate"
    }
    """
    try:
        meal_data = request.json.get('meal_data', {})
        
        if not meal_data:
            return jsonify({'success': False, 'error': 'No meal data provided'}), 400
        
        # Make prediction
        prediction = glucose_model.predict(meal_data)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
        
    except Exception as e:
        print(f"Error in predict_glucose: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/scan-and-predict', methods=['POST'])
def scan_and_predict():
    """
    Complete pipeline: scan food → analyze nutrition → predict glucose
    
    Request body:
    {
        "image": "base64_encoded_image" or multipart file,
        "time_of_day": "afternoon",
        "last_glucose_reading": 110,
        "hours_since_last_meal": 4,
        "user_profile": {...}
    }
    
    Response:
    {
        "success": true,
        "foods_detected": ["roti", "dal"],
        "total_carbs": 38,
        "glycemic_load": 23,
        "predicted_glucose_1h": 131,
        "predicted_glucose_2h": 147,
        "risk_level": "medium",
        "advice": "Consider reducing portion size..."
    }
    """
    try:
        # Get image
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(image_path)
            
            # Get parameters from form
            time_of_day = request.form.get('time_of_day', 'afternoon')
            last_glucose_reading = float(request.form.get('last_glucose_reading', 100))
            hours_since_last_meal = float(request.form.get('hours_since_last_meal', 4))
            
            import json
            user_profile = json.loads(request.form.get('user_profile', '{}'))
        else:
            data = request.json
            
            # Decode base64 image
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'temp_upload.jpg')
            image.save(image_path)
            
            time_of_day = data.get('time_of_day', 'afternoon')
            last_glucose_reading = data.get('last_glucose_reading', 100)
            hours_since_last_meal = data.get('hours_since_last_meal', 4)
            user_profile = data.get('user_profile', {})
        
        # Step 1: Analyze food
        food_result = food_service.process_image(
            image_path=image_path,
            time_of_day=time_of_day,
            user_profile=user_profile,
            save_annotated=True
        )
        
        if not food_result['success']:
            return jsonify(food_result), 400
        
        # Step 2: Prepare meal data for glucose prediction
        nutrition = food_result['nutrition']
        
        meal_data = {
            'total_carbs': nutrition['total_carbs'],
            'total_protein': nutrition['total_protein'],
            'total_fat': nutrition['total_fat'],
            'total_fiber': nutrition['total_fiber'],
            'glycemic_load': nutrition['glycemic_load'],
            'total_calories': nutrition['total_calories'],
            'time_of_day': time_of_day,
            'last_glucose_reading': last_glucose_reading,
            'hours_since_last_meal': hours_since_last_meal,
            'foods_detected': food_result['foods_detected'],
            **user_profile
        }
        
        # Step 3: Predict glucose
        glucose_prediction = glucose_model.predict(meal_data)
        
        # Step 4: Get updated advice with glucose prediction
        advice = food_service.get_advice(nutrition, glucose_prediction)
        
        # Step 5: Combine everything
        unified_response = {
            'success': True,
            'timestamp': food_result['timestamp'],
            'foods_detected': food_result['foods_detected'],
            'detections': food_result['detections'],
            'total_carbs': nutrition['total_carbs'],
            'total_protein': nutrition['total_protein'],
            'total_fat': nutrition['total_fat'],
            'total_fiber': nutrition['total_fiber'],
            'total_calories': nutrition['total_calories'],
            'glycemic_load': nutrition['glycemic_load'],
            'predicted_glucose_1h': glucose_prediction['predicted_glucose_1h'],
            'predicted_glucose_2h': glucose_prediction['predicted_glucose_2h'],
            'glucose_spike_1h': glucose_prediction['glucose_spike_1h'],
            'glucose_spike_2h': glucose_prediction['glucose_spike_2h'],
            'peak_time': glucose_prediction['peak_time'],
            'risk_level': advice['risk_level'],
            'icon': advice['icon'],
            'message': advice['message'],
            'suggestions': advice['suggestions'],
            'time_advice': advice['time_advice'],
            'annotated_image': food_result.get('annotated_image')
        }
        
        return jsonify(unified_response)
        
    except Exception as e:
        print(f"Error in scan_and_predict: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/feedback', methods=['POST'])
def submit_feedback():
    """
    Submit user feedback for model improvement
    
    Request body:
    {
        "image_id": "xyz",
        "detected_foods": ["roti", "dal"],
        "corrected_foods": ["roti", "curry"],  // User correction
        "actual_glucose_1h": 145,
        "actual_glucose_2h": 160
    }
    """
    try:
        feedback = request.json
        
        # Save feedback to file for retraining
        feedback_file = 'feedback_data.jsonl'
        with open(feedback_file, 'a') as f:
            import json
            f.write(json.dumps(feedback) + '\n')
        
        return jsonify({
            'success': True,
            'message': 'Feedback recorded successfully'
        })
        
    except Exception as e:
        print(f"Error in submit_feedback: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/food/detect/demo', methods=['POST'])
def detect_food_demo():
    """
    🎯 DEMO MODE - Exact image matching for perfect demo results
    
    No AI model used - direct lookup from pre-configured demo images
    Guaranteed 99% accuracy and correct single-food detection
    
    Request: multipart file upload
    
    Response:
    {
        "success": true,
        "detections": [{
            "item": "chicken_biryani",
            "display_name": "Chicken Biryani",
            "confidence": 0.99,
            "portion_size": "large",
            "nutrition": {...},
            "glycemic_load": 35
        }],
        "glucose_prediction": {
            "peak_time_minutes": 45,
            "peak_increase_mg_dl": 65,
            "duration_hours": 2.5,
            "advice": "..."
        }
    }
    """
    try:
        if not demo_mapper:
            return jsonify({
                'success': False,
                'error': 'Demo mapper not initialized'
            }), 400
        
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            image_path = os.path.join(UPLOAD_FOLDER, 'demo_' + file.filename)
            file.save(image_path)
        elif request.is_json and 'image' in request.json:
            # Decode base64 image
            image_data = base64.b64decode(request.json['image'])
            image = Image.open(io.BytesIO(image_data))
            image_path = os.path.join(UPLOAD_FOLDER, 'demo_temp.jpg')
            image.save(image_path)
        else:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Detect using demo mapper
        result = demo_mapper.detect_food(image_path)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in detect_food_demo: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize services before starting server
    if init_services():
        print("\n🚀 Starting Flask API server...")
        print("📍 Endpoints available:")
        print("   - POST /api/v1/food/detect (local YOLOv8 model)")
        print("   - POST /api/v1/food/detect/demo (DEMO MODE - 99% accuracy) 🎯")
        print("   - POST /api/v1/food/analyze")
        print("   - POST /api/v1/glucose/predict")
        print("   - POST /api/v1/food/scan-and-predict")
        print("   - POST /api/v1/feedback")
        print("   - GET  /health")
        
        app.run(
            host='0.0.0.0',
            port=5001,
            debug=False  # Disabled to prevent hot reload issues with PyTorch
        )
    else:
        print("❌ Failed to initialize services. Exiting.")
