"""
LogMeal API Integration for Food Detection
Free tier: 500 requests/month
Best for Indian food recognition
"""

import requests
import base64
from typing import List, Dict, Any
from pathlib import Path

class LogMealDetector:
    """LogMeal API food detection service"""
    
    def __init__(self, api_token: str):
        """
        Initialize LogMeal detector
        
        Args:
            api_token: LogMeal API token (get free at https://logmeal.es)
        """
        self.api_token = api_token
        self.base_url = "https://api.logmeal.es/v2"
        self.headers = {
            "Authorization": f"Bearer {api_token}"
        }
    
    def detect_food(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Detect food items in image using LogMeal API
        
        Args:
            image_path: Path to food image
            
        Returns:
            List of detected food items with confidence and nutrition
        """
        # Read and encode image
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Call LogMeal recognition API
        endpoint = f"{self.base_url}/image/recognition/complete"
        
        payload = {
            "image": image_data
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            # Parse results
            detections = []
            
            if 'recognition_results' in result:
                for item in result['recognition_results']:
                    detection = {
                        'item': item.get('name', 'unknown').lower().replace(' ', '_'),
                        'confidence': item.get('prob', 0.0),
                        'food_id': item.get('food_id'),
                        'food_type': item.get('food_type', 'unknown'),
                        'detection_method': 'logmeal_api'
                    }
                    
                    # Get nutrition if available
                    if 'nutritional_info' in item:
                        nutrition = item['nutritional_info']
                        detection['nutrition'] = {
                            'calories': nutrition.get('calories', 0),
                            'carbs': nutrition.get('carbs', 0),
                            'protein': nutrition.get('protein', 0),
                            'fat': nutrition.get('fat', 0)
                        }
                    
                    detections.append(detection)
            
            # Sort by confidence
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            return detections
            
        except requests.exceptions.RequestException as e:
            print(f"❌ LogMeal API Error: {e}")
            return []
        except Exception as e:
            print(f"❌ Error processing LogMeal response: {e}")
            return []
    
    def get_nutrition(self, food_id: str) -> Dict[str, Any]:
        """
        Get detailed nutrition info for a food item
        
        Args:
            food_id: LogMeal food ID
            
        Returns:
            Detailed nutrition information
        """
        endpoint = f"{self.base_url}/nutrition/recipe_nutritional_info"
        
        payload = {
            "foodId": food_id
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"⚠️  Could not fetch nutrition: {e}")
            return {}


def test_logmeal():
    """Test LogMeal API integration"""
    
    # You need to get a free API token from https://logmeal.es/developers/
    # Sign up is free and takes 2 minutes
    API_TOKEN = "YOUR_LOGMEAL_API_TOKEN_HERE"
    
    if API_TOKEN == "YOUR_LOGMEAL_API_TOKEN_HERE":
        print("\n" + "="*60)
        print("⚠️  LogMeal API Token Required")
        print("="*60)
        print("\n📝 To get your FREE API token:")
        print("   1. Go to: https://logmeal.es/developers/")
        print("   2. Sign up (free)")
        print("   3. Copy your API token")
        print("   4. Replace 'YOUR_LOGMEAL_API_TOKEN_HERE' in this file")
        print("\n✅ Free tier includes 500 requests/month")
        print("="*60 + "\n")
        return
    
    # Initialize detector
    detector = LogMealDetector(API_TOKEN)
    
    # Test with an image
    test_image = "uploads/test_food.jpg"
    
    print("\n" + "="*60)
    print("🍽️  TESTING LOGMEAL API FOOD DETECTION")
    print("="*60 + "\n")
    
    results = detector.detect_food(test_image)
    
    if results:
        print(f"✅ Detected {len(results)} food items:\n")
        for i, item in enumerate(results, 1):
            print(f"{i}. {item['item'].upper()}")
            print(f"   Confidence: {item['confidence']*100:.1f}%")
            print(f"   Type: {item['food_type']}")
            if 'nutrition' in item:
                print(f"   Calories: {item['nutrition']['calories']}")
                print(f"   Carbs: {item['nutrition']['carbs']}g")
            print()
    else:
        print("❌ No food detected or API error")


if __name__ == "__main__":
    test_logmeal()
