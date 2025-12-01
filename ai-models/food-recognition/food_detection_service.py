"""
YOLOv8 Inference Service for Indian Food Detection
Handles food detection, bounding boxes, and nutrition mapping
"""

import os
import json
from typing import List, Dict, Any, Tuple
from pathlib import Path
import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import importlib.util

class FoodDetectionService:
    """Main service for food detection and nutrition analysis"""
    
    def __init__(self, model_path: str, nutrition_db_path: str, use_fallback: bool = True):
        """
        Initialize the food detection service
        
        Args:
            model_path: Path to trained YOLOv8 model (.pt file)
            nutrition_db_path: Path to nutrition database JSON
            use_fallback: Enable fallback detection for untrained items
        """
        self.model = YOLO(model_path)
        self.use_fallback = use_fallback
        
        # Initialize fallback detector
        if use_fallback:
            try:
                fallback_spec = importlib.util.spec_from_file_location(
                    "fallback_detector",
                    Path(__file__).parent / "fallback_detector.py"
                )
                fallback_module = importlib.util.module_from_spec(fallback_spec)
                fallback_spec.loader.exec_module(fallback_module)
                self.fallback_detector = fallback_module.FallbackFoodDetector()
                print("✅ Fallback detector enabled (generic food recognition)")
            except Exception as e:
                print(f"⚠️  Fallback detector failed to load: {e}")
                self.fallback_detector = None
        else:
            self.fallback_detector = None
        
        # Map trained model class names to nutrition database keys
        self.indian_food_mapping = {
            'Idly': 'idli',
            'bisibele bath': 'bisibele_bath',
            'chapathi': 'chapati',
            'chicken biriyani': 'biryani',
            'dosa': 'dosa',
            'kesari bath': 'kesari_bath',
            'khara pongal': 'pongal',
            'lemon rice': 'lemon_rice',
            'non veg meals': 'mixed_meal',
            'poori': 'puri',
            'puliyogare': 'tamarind_rice',
            'rave idli': 'idli',
            'shavige payasa': 'payasam',
            'upma': 'upma',
            'vangi bath': 'vangi_bath',
            'veg meals': 'mixed_meal',
            'veg palav': 'pulao'
        }
        
        # Load nutrition database
        with open(nutrition_db_path, 'r', encoding='utf-8') as f:
            self.nutrition_data = json.load(f)
        
        self.food_db = self.nutrition_data['nutritionDatabase']
        self.portion_rules = self.nutrition_data['portionEstimation']
        self.combination_rules = self.nutrition_data['mealCombinationRules']
        self.advice_engine = self.nutrition_data['adviceEngine']
        
        print(f"✅ Model loaded: {model_path}")
        print(f"✅ Nutrition database loaded: {nutrition_db_path}")
        print(f"🎯 Using custom trained model: indian-food-v14 (40 epochs, 80.85% mAP50)")
    
    def detect_foods(
        self, 
        image_path: str, 
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> List[Dict[str, Any]]:
        """
        Detect foods in image and return structured results
        
        Args:
            image_path: Path to input image
            conf_threshold: Confidence threshold (0-1)
            iou_threshold: NMS IoU threshold
            
        Returns:
            List of detected foods with boxes and metadata
        """
        # Run inference
        results = self.model.predict(
            source=image_path,
            conf=conf_threshold,
            iou=iou_threshold,
            verbose=False
        )
        
        detections = []
        
        for result in results:
            boxes = result.boxes
            image_shape = result.orig_shape
            
            for box in boxes:
                # Extract box data
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy()
                
                # Get class name from trained model
                detected_class = self.model.names[cls_id]
                
                # Map to nutrition database key
                food_name = self.indian_food_mapping.get(detected_class, detected_class.lower().replace(' ', '_'))
                
                # Calculate box area
                box_width = xyxy[2] - xyxy[0]
                box_height = xyxy[3] - xyxy[1]
                box_area = box_width * box_height
                
                # Estimate portion size
                portion_info = self._estimate_portion(
                    food_name, 
                    box_area, 
                    image_shape, 
                    confidence
                )
                
                detection = {
                    "item": food_name,
                    "confidence": round(confidence, 3),
                    "bounding_box": [
                        int(xyxy[0]), 
                        int(xyxy[1]), 
                        int(xyxy[2]), 
                        int(xyxy[3])
                    ],
                    "box_area": int(box_area),
                    "portion_size": portion_info['size'],
                    "estimated_weight": portion_info['weight']
                }
                
                detections.append(detection)
        
        # Apply fallback detection if enabled
        if self.fallback_detector and len(detections) < 3:
            try:
                fallback_items = self.fallback_detector.detect_by_color(image_path)
                if fallback_items:
                    # Merge with primary detections
                    detections = self.fallback_detector.merge_detections(detections, fallback_items)
                    print(f"🔍 Fallback detector found {len(fallback_items)} additional items")
            except Exception as e:
                print(f"⚠️  Fallback detection error: {e}")
        
        return detections
    
    def _estimate_portion(
        self, 
        food_name: str, 
        box_area: float, 
        image_shape: Tuple, 
        confidence: float
    ) -> Dict[str, Any]:
        """
        Estimate portion size from bounding box area
        
        Args:
            food_name: Detected food item
            box_area: Bounding box area in pixels
            image_shape: (height, width) of image
            confidence: Detection confidence
            
        Returns:
            Dictionary with portion size and estimated weight
        """
        # Calculate relative area (percentage of image)
        image_area = image_shape[0] * image_shape[1]
        relative_area = box_area / image_area
        
        # Determine portion size based on relative area
        if relative_area < 0.08:
            size = "small"
        elif relative_area < 0.20:
            size = "medium"
        else:
            size = "large"
        
        # Adjust for confidence
        if confidence < 0.65:
            uncertainty_factor = 1.2
        elif confidence < 0.85:
            uncertainty_factor = 1.1
        else:
            uncertainty_factor = 1.0
        
        # Get nutrition data for this food
        if food_name in self.food_db:
            food_data = self.food_db[food_name]
            weight = food_data['portionSizes'][size]['weight'] * uncertainty_factor
        else:
            # Default weight if food not in database
            weight = {'small': 80, 'medium': 120, 'large': 180}[size]
        
        return {
            'size': size,
            'weight': round(weight, 1),
            'relative_area': round(relative_area, 3),
            'uncertainty_factor': uncertainty_factor
        }
    
    def calculate_nutrition(
        self, 
        detections: List[Dict], 
        time_of_day: str = "afternoon",
        user_profile: Dict = None
    ) -> Dict[str, Any]:
        """
        Calculate total nutrition from detected foods
        
        Args:
            detections: List of detected foods
            time_of_day: "morning", "afternoon", "evening", or "night"
            user_profile: User's activity level, diabetes type, etc.
            
        Returns:
            Comprehensive nutrition analysis
        """
        total_carbs = 0.0
        total_protein = 0.0
        total_fat = 0.0
        total_fiber = 0.0
        total_calories = 0.0
        weighted_gl = 0.0
        
        food_details = []
        detected_items = [d['item'] for d in detections]
        
        for detection in detections:
            food_name = detection['item']
            portion_size = detection['portion_size']
            
            if food_name not in self.food_db:
                print(f"⚠️ Warning: {food_name} not in nutrition database")
                continue
            
            food_data = self.food_db[food_name]
            portion_data = food_data['portionSizes'][portion_size]
            
            # Get base nutrition
            carbs = portion_data['carbs']
            gl = portion_data['gl']
            
            # Apply time-of-day multiplier
            time_multiplier = food_data['timeImpact'].get(time_of_day, 1.0)
            adjusted_gl = gl * time_multiplier
            
            # Accumulate totals
            total_carbs += carbs
            weighted_gl += adjusted_gl
            total_protein += food_data['protein'] * (portion_data['weight'] / food_data['servingSize'].split('(')[1].split('g')[0].strip())
            total_fat += food_data['fat'] * (portion_data['weight'] / float(food_data['servingSize'].split('(')[1].split('g')[0].strip()))
            total_fiber += food_data['fiber'] * (portion_data['weight'] / float(food_data['servingSize'].split('(')[1].split('g')[0].strip()))
            total_calories += food_data['calories'] * (portion_data['weight'] / float(food_data['servingSize'].split('(')[1].split('g')[0].strip()))
            
            food_details.append({
                'name': food_name,
                'portion': portion_size,
                'carbs': round(carbs, 1),
                'gl': round(adjusted_gl, 1),
                'weight': portion_data['weight']
            })
        
        # Apply meal combination effects
        gl_modifier = self._calculate_combination_effect(detected_items)
        adjusted_gl = weighted_gl * gl_modifier
        
        # Apply user profile adjustments
        if user_profile:
            adjusted_gl = self._apply_user_adjustments(adjusted_gl, user_profile)
        
        return {
            'total_carbs': round(total_carbs, 1),
            'total_protein': round(total_protein, 1),
            'total_fat': round(total_fat, 1),
            'total_fiber': round(total_fiber, 1),
            'total_calories': round(total_calories, 0),
            'glycemic_load': round(adjusted_gl, 1),
            'time_of_day': time_of_day,
            'food_details': food_details,
            'combination_effect': gl_modifier
        }
    
    def _calculate_combination_effect(self, detected_items: List[str]) -> float:
        """Calculate GL reduction from food combinations"""
        modifier = 1.0
        
        for rule in self.combination_rules['thaliEffect']['rules']:
            combo = rule['combination']
            # Check if all items in combination are present
            if all(item in detected_items for item in combo):
                modifier *= rule['giReduction']
                print(f"✅ Combination detected: {' + '.join(combo)} → {rule['reason']}")
        
        return modifier
    
    def _apply_user_adjustments(self, gl: float, user_profile: Dict) -> float:
        """Apply user-specific adjustments to GL"""
        adjustments = self.nutrition_data['userProfileAdjustments']
        
        # Activity level
        if 'activityLevel' in user_profile:
            activity = user_profile['activityLevel']
            if activity in adjustments['activityLevel']:
                gl *= adjustments['activityLevel'][activity]['multiplier']
        
        # Diabetes type
        if 'diabetesType' in user_profile:
            diabetes = user_profile['diabetesType']
            if diabetes in adjustments['diabetesType']:
                gl *= adjustments['diabetesType'][diabetes]['multiplier']
        
        # Medication effect
        if 'medication' in user_profile:
            medication = user_profile['medication']
            if medication in adjustments['medicationEffect']:
                gl *= adjustments['medicationEffect'][medication]['glReduction']
        
        return gl
    
    def get_advice(
        self, 
        nutrition_summary: Dict, 
        predicted_glucose: Dict = None
    ) -> Dict[str, Any]:
        """
        Generate personalized advice based on nutrition and predictions
        
        Args:
            nutrition_summary: Output from calculate_nutrition()
            predicted_glucose: Predictions from XGBoost model (optional)
            
        Returns:
            Risk assessment and recommendations
        """
        total_carbs = nutrition_summary['total_carbs']
        gl = nutrition_summary['glycemic_load']
        
        # Determine risk level
        if predicted_glucose:
            predicted_spike = predicted_glucose.get('sugar_after_2_hours', 0)
        else:
            # Estimate spike from GL
            predicted_spike = 100 + (gl * 3)  # Rough estimate
        
        # Classify risk
        if total_carbs < 40 and gl < 20 and predicted_spike < 140:
            risk = "low"
            advice_data = self.advice_engine['lowRisk']
        elif total_carbs < 60 and gl < 30 and predicted_spike < 180:
            risk = "moderate"
            advice_data = self.advice_engine['moderateRisk']
        else:
            risk = "high"
            advice_data = self.advice_engine['highRisk']
        
        # Time-based recommendations
        time_of_day = nutrition_summary['time_of_day']
        time_recommendations = self.nutrition_data['timeBasedRecommendations'][time_of_day]
        
        return {
            'risk_level': risk,
            'icon': advice_data['icon'],
            'message': advice_data['message'],
            'suggestions': advice_data.get('suggestions', []),
            'predicted_spike': round(predicted_spike, 0),
            'time_advice': time_recommendations['note'],
            'ideal_foods': time_recommendations['idealFoods'],
            'foods_to_avoid': time_recommendations['avoid']
        }
    
    def process_image(
        self, 
        image_path: str,
        time_of_day: str = "afternoon",
        user_profile: Dict = None,
        save_annotated: bool = True
    ) -> Dict[str, Any]:
        """
        Complete pipeline: detect → calculate nutrition → generate advice
        
        Args:
            image_path: Path to food image
            time_of_day: When the meal is being consumed
            user_profile: User's health profile
            save_annotated: Whether to save image with bounding boxes
            
        Returns:
            Complete analysis with detections, nutrition, and advice
        """
        print(f"\n🔍 Processing: {image_path}")
        
        # Step 1: Detect foods
        detections = self.detect_foods(image_path)
        print(f"✅ Detected {len(detections)} food items")
        
        if len(detections) == 0:
            return {
                'success': False,
                'message': 'No food items detected. Please try again with a clearer image.',
                'detections': []
            }
        
        # Step 2: Calculate nutrition
        nutrition = self.calculate_nutrition(detections, time_of_day, user_profile)
        print(f"📊 Total carbs: {nutrition['total_carbs']}g, GL: {nutrition['glycemic_load']}")
        
        # Step 3: Generate advice
        advice = self.get_advice(nutrition)
        print(f"{advice['icon']} Risk: {advice['risk_level']}")
        
        # Step 4: Save annotated image
        if save_annotated:
            annotated_path = self._save_annotated_image(image_path, detections)
        else:
            annotated_path = None
        
        # Combine results
        return {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'foods_detected': [d['item'] for d in detections],
            'detections': detections,
            'nutrition': nutrition,
            'advice': advice,
            'annotated_image': annotated_path
        }
    
    def _save_annotated_image(
        self, 
        image_path: str, 
        detections: List[Dict]
    ) -> str:
        """Draw bounding boxes and save annotated image"""
        img = cv2.imread(image_path)
        
        for det in detections:
            x1, y1, x2, y2 = det['bounding_box']
            conf = det['confidence']
            label = f"{det['item']} {conf:.2f}"
            
            # Draw box
            color = (0, 255, 0)  # Green
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            
            # Draw label background
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(img, (x1, y1 - 20), (x1 + w, y1), color, -1)
            
            # Draw text
            cv2.putText(img, label, (x1, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        
        # Save
        output_path = image_path.replace('.jpg', '_annotated.jpg')
        cv2.imwrite(output_path, img)
        print(f"💾 Annotated image saved: {output_path}")
        
        return output_path


# Example usage
if __name__ == "__main__":
    # Initialize service
    service = FoodDetectionService(
        model_path="models/food-recognition/indian-food-v14/weights/best.pt",
        nutrition_db_path="food-recognition/nutrition_database.json"
    )
    
    # Process image
    result = service.process_image(
        image_path="test_images/thali.jpg",
        time_of_day="afternoon",
        user_profile={
            'activityLevel': 'moderate',
            'diabetesType': 'prediabetic',
            'medication': None
        }
    )
    
    # Print results
    print("\n" + "="*50)
    print("DETECTION RESULTS")
    print("="*50)
    print(json.dumps(result, indent=2))
