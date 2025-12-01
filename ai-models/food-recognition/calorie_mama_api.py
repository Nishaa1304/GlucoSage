"""
Calorie Mama API Integration for Food Detection
Uses RapidAPI to detect food items and retrieve nutrition data
"""

import requests
import base64
import json
import os
from typing import Dict, List, Any, Optional

class CalorieMamaDetector:
    """
    Calorie Mama API client for food detection and nutrition analysis
    """
    
    def __init__(self, api_key: str):
        """
        Initialize Calorie Mama API client
        
        Args:
            api_key: RapidAPI key for Calorie Mama
        """
        self.api_key = api_key
        self.base_url = "https://calorie-mama-food-nutrition-analysis.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "calorie-mama-food-nutrition-analysis.p.rapidapi.com"
        }
    
    def detect_food(self, image_path: str) -> Dict[str, Any]:
        """
        Detect food items in an image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing detected food items with nutrition data
        """
        try:
            # Read and encode image
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Prepare request
            url = f"{self.base_url}/api/v1/foodrecognition"
            
            # Calorie Mama expects multipart/form-data with base64 image
            files = {
                'image': (os.path.basename(image_path), base64.b64decode(image_data), 'image/jpeg')
            }
            
            # Make API request
            response = requests.post(
                url,
                headers=self.headers,
                files=files,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Process response
            return self._process_detection_result(result)
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'API request failed: {str(e)}',
                'detections': []
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Detection failed: {str(e)}',
                'detections': []
            }
    
    def _process_detection_result(self, api_response: Dict) -> Dict[str, Any]:
        """
        Process Calorie Mama API response into standardized format
        
        Args:
            api_response: Raw API response
            
        Returns:
            Processed detection results
        """
        detections = []
        
        # Calorie Mama response structure:
        # {
        #     "items": [
        #         {
        #             "name": "biryani",
        #             "nutrition": {
        #                 "calories": 450,
        #                 "carbs": 60,
        #                 "protein": 15,
        #                 "fat": 18,
        #                 ...
        #             }
        #         }
        #     ]
        # }
        
        if 'items' in api_response:
            for item in api_response['items']:
                detection = {
                    'item': item.get('name', 'unknown').lower().replace(' ', '_'),
                    'confidence': item.get('confidence', 0.85),  # Calorie Mama doesn't always provide confidence
                    'nutrition': self._extract_nutrition(item.get('nutrition', {})),
                    'detection_method': 'calorie_mama_api',
                    'portion_size': item.get('serving_size', 'medium'),
                    'estimated_weight': item.get('serving_weight_grams', 150.0)
                }
                detections.append(detection)
        
        return {
            'success': True,
            'detections': detections,
            'total_items': len(detections)
        }
    
    def _extract_nutrition(self, nutrition_data: Dict) -> Dict[str, float]:
        """
        Extract nutrition information from API response
        
        Args:
            nutrition_data: Nutrition data from API
            
        Returns:
            Standardized nutrition dictionary
        """
        return {
            'calories': float(nutrition_data.get('calories', 0)),
            'carbohydrates': float(nutrition_data.get('carbs', 0)),
            'protein': float(nutrition_data.get('protein', 0)),
            'fat': float(nutrition_data.get('fat', 0)),
            'fiber': float(nutrition_data.get('fiber', 0)),
            'sugar': float(nutrition_data.get('sugar', 0)),
            'sodium': float(nutrition_data.get('sodium', 0))
        }
    
    def get_detailed_nutrition(self, food_name: str) -> Optional[Dict]:
        """
        Get detailed nutrition information for a specific food item
        
        Args:
            food_name: Name of the food item
            
        Returns:
            Detailed nutrition data or None
        """
        try:
            url = f"{self.base_url}/api/v1/nutrition"
            params = {'food': food_name}
            
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=15
            )
            
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            print(f"Failed to get detailed nutrition: {e}")
            return None
    
    def test_connection(self) -> bool:
        """
        Test API connection and authentication
        
        Returns:
            True if connection successful
        """
        try:
            # Simple test request
            url = f"{self.base_url}/api/v1/status"
            response = requests.get(url, headers=self.headers, timeout=10)
            return response.status_code == 200
        except:
            return False


def test_calorie_mama():
    """Test function for Calorie Mama API"""
    api_key = os.getenv('CALORIE_MAMA_API_KEY')
    
    if not api_key:
        print("❌ CALORIE_MAMA_API_KEY not found in environment")
        return
    
    print("🔑 API Key loaded")
    detector = CalorieMamaDetector(api_key)
    
    print("🔍 Testing connection...")
    if detector.test_connection():
        print("✅ Connection successful")
    else:
        print("⚠️ Connection test skipped (endpoint may not exist)")
    
    # Test with sample image
    test_image = "../dataset/raw-images/biryani/biryani_1.jpg"
    if os.path.exists(test_image):
        print(f"\n📸 Testing detection on: {test_image}")
        result = detector.detect_food(test_image)
        print(json.dumps(result, indent=2))
    else:
        print(f"⚠️ Test image not found: {test_image}")


if __name__ == "__main__":
    test_calorie_mama()
