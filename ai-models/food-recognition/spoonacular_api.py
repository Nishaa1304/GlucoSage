"""
Spoonacular API Integration for Food Detection
More reliable than Calorie Mama, excellent for food recognition
"""

import requests
import base64
import json
import os
from typing import Dict, List, Any, Optional

class SpoonacularDetector:
    """
    Spoonacular API client for food detection and nutrition analysis
    """
    
    def __init__(self, api_key: str):
        """
        Initialize Spoonacular API client
        
        Args:
            api_key: RapidAPI key for Spoonacular or direct Spoonacular API key
        """
        self.api_key = api_key
        
        # Spoonacular has two endpoints options:
        # 1. Via RapidAPI
        # 2. Direct Spoonacular API
        
        # Check if it's a RapidAPI key (starts with certain patterns) or direct key
        self.use_rapidapi = len(api_key) > 50  # RapidAPI keys are typically longer
        
        if self.use_rapidapi:
            # RapidAPI endpoint
            self.base_url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
            self.headers = {
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
            }
        else:
            # Direct Spoonacular endpoint
            self.base_url = "https://api.spoonacular.com"
            self.headers = {}
    
    def detect_food(self, image_path: str) -> Dict[str, Any]:
        """
        Detect food items in an image using Spoonacular's image analysis
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing detected food items with nutrition data
        """
        try:
            # Spoonacular uses multipart file upload
            with open(image_path, 'rb') as image_file:
                files = {'file': (os.path.basename(image_path), image_file, 'image/jpeg')}
                
                if self.use_rapidapi:
                    # RapidAPI endpoint
                    url = f"{self.base_url}/food/images/analyze"
                    response = requests.post(url, headers=self.headers, files=files, timeout=30)
                else:
                    # Direct Spoonacular endpoint
                    url = f"{self.base_url}/food/images/analyze"
                    params = {'apiKey': self.api_key}
                    response = requests.post(url, params=params, files=files, timeout=30)
            
            response.raise_for_status()
            result = response.json()
            
            # Process response
            return self._process_detection_result(result, image_path)
            
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
    
    def _process_detection_result(self, api_response: Dict, image_path: str) -> Dict[str, Any]:
        """
        Process Spoonacular API response into standardized format
        
        Args:
            api_response: Raw API response
            image_path: Path to analyzed image
            
        Returns:
            Processed detection results
        """
        detections = []
        
        # Spoonacular image analysis response structure:
        # {
        #     "category": {
        #         "name": "curry",
        #         "probability": 0.9523
        #     },
        #     "recipes": [...],
        #     "nutrition": {...}
        # }
        
        if 'category' in api_response:
            category = api_response['category']
            food_name = category.get('name', 'unknown').lower()
            confidence = category.get('probability', 0.85)
            
            # Get nutrition data if available
            nutrition_data = api_response.get('nutrition', {})
            
            detection = {
                'item': food_name.replace(' ', '_'),
                'confidence': confidence,
                'nutrition': self._extract_nutrition(nutrition_data),
                'detection_method': 'spoonacular_api',
                'portion_size': self._estimate_portion(nutrition_data),
                'estimated_weight': self._estimate_weight(nutrition_data)
            }
            
            # Add recipes if available
            if 'recipes' in api_response and api_response['recipes']:
                detection['similar_recipes'] = [
                    {'title': r.get('title', ''), 'id': r.get('id', 0)}
                    for r in api_response['recipes'][:3]  # Top 3 matches
                ]
            
            detections.append(detection)
        
        # If we didn't get category but got recipes, infer from recipes
        elif 'recipes' in api_response and api_response['recipes']:
            # Use the top recipe match
            top_recipe = api_response['recipes'][0]
            
            detection = {
                'item': top_recipe.get('title', 'unknown').lower().replace(' ', '_'),
                'confidence': 0.75,  # Lower confidence when inferring from recipes
                'detection_method': 'spoonacular_api',
                'portion_size': 'medium',
                'estimated_weight': 150.0
            }
            
            detections.append(detection)
        
        return {
            'success': len(detections) > 0,
            'detections': detections,
            'total_items': len(detections),
            'raw_response': api_response  # Keep for debugging
        }
    
    def _extract_nutrition(self, nutrition_data: Dict) -> Dict[str, float]:
        """
        Extract nutrition information from API response
        
        Args:
            nutrition_data: Nutrition data from API
            
        Returns:
            Standardized nutrition dictionary
        """
        if not nutrition_data:
            return {}
        
        # Spoonacular returns nutrients as array
        nutrients = nutrition_data.get('nutrients', [])
        
        nutrition = {}
        for nutrient in nutrients:
            name = nutrient.get('name', '').lower()
            amount = float(nutrient.get('amount', 0))
            
            if 'calorie' in name:
                nutrition['calories'] = amount
            elif 'carbohydrate' in name:
                nutrition['carbohydrates'] = amount
            elif 'protein' in name:
                nutrition['protein'] = amount
            elif 'fat' in name and 'saturated' not in name:
                nutrition['fat'] = amount
            elif 'fiber' in name:
                nutrition['fiber'] = amount
            elif 'sugar' in name:
                nutrition['sugar'] = amount
            elif 'sodium' in name:
                nutrition['sodium'] = amount
        
        return nutrition
    
    def _estimate_portion(self, nutrition_data: Dict) -> str:
        """Estimate portion size from nutrition data"""
        if not nutrition_data:
            return 'medium'
        
        calories = 0
        nutrients = nutrition_data.get('nutrients', [])
        for nutrient in nutrients:
            if 'calorie' in nutrient.get('name', '').lower():
                calories = float(nutrient.get('amount', 0))
                break
        
        if calories < 150:
            return 'small'
        elif calories > 400:
            return 'large'
        else:
            return 'medium'
    
    def _estimate_weight(self, nutrition_data: Dict) -> float:
        """Estimate weight in grams from nutrition data"""
        if not nutrition_data:
            return 150.0
        
        # Look for serving size
        calories = 0
        nutrients = nutrition_data.get('nutrients', [])
        for nutrient in nutrients:
            if 'calorie' in nutrient.get('name', '').lower():
                calories = float(nutrient.get('amount', 0))
                break
        
        # Rough estimate: ~1.5 calories per gram for mixed foods
        if calories > 0:
            return round(calories / 1.5, 1)
        
        return 150.0
    
    def search_recipes(self, query: str, number: int = 5) -> List[Dict]:
        """
        Search for recipes by name or ingredients
        
        Args:
            query: Search query (food name or ingredients)
            number: Number of results to return
            
        Returns:
            List of recipe results
        """
        try:
            if self.use_rapidapi:
                url = f"{self.base_url}/recipes/complexSearch"
                params = {'query': query, 'number': number}
                response = requests.get(url, headers=self.headers, params=params, timeout=15)
            else:
                url = f"{self.base_url}/recipes/complexSearch"
                params = {'apiKey': self.api_key, 'query': query, 'number': number}
                response = requests.get(url, params=params, timeout=15)
            
            response.raise_for_status()
            return response.json().get('results', [])
            
        except Exception as e:
            print(f"Failed to search recipes: {e}")
            return []
    
    def get_recipe_nutrition(self, recipe_id: int) -> Optional[Dict]:
        """
        Get detailed nutrition information for a recipe
        
        Args:
            recipe_id: Spoonacular recipe ID
            
        Returns:
            Nutrition data or None
        """
        try:
            if self.use_rapidapi:
                url = f"{self.base_url}/recipes/{recipe_id}/nutritionWidget.json"
                response = requests.get(url, headers=self.headers, timeout=15)
            else:
                url = f"{self.base_url}/recipes/{recipe_id}/nutritionWidget.json"
                params = {'apiKey': self.api_key}
                response = requests.get(url, params=params, timeout=15)
            
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            print(f"Failed to get recipe nutrition: {e}")
            return None
    
    def test_connection(self) -> bool:
        """
        Test API connection and authentication
        
        Returns:
            True if connection successful
        """
        try:
            # Simple test with recipe search
            if self.use_rapidapi:
                url = f"{self.base_url}/recipes/complexSearch"
                params = {'query': 'pasta', 'number': 1}
                response = requests.get(url, headers=self.headers, params=params, timeout=10)
            else:
                url = f"{self.base_url}/recipes/complexSearch"
                params = {'apiKey': self.api_key, 'query': 'pasta', 'number': 1}
                response = requests.get(url, params=params, timeout=10)
            
            return response.status_code == 200
        except:
            return False


def test_spoonacular():
    """Test function for Spoonacular API"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('SPOONACULAR_API_KEY')
    
    if not api_key:
        print("❌ SPOONACULAR_API_KEY not found in environment")
        print("\n📋 Get your FREE API key:")
        print("Option 1 (Recommended): https://spoonacular.com/food-api/console#Dashboard")
        print("  • 150 requests/day FREE")
        print("  • Direct API access")
        print("\nOption 2: https://rapidapi.com/spoonacular/api/spoonacular-recipe-food-nutrition-v1")
        print("  • Via RapidAPI")
        return
    
    print("🔑 API Key loaded")
    detector = SpoonacularDetector(api_key)
    
    print("🔍 Testing connection...")
    if detector.test_connection():
        print("✅ Connection successful")
    else:
        print("❌ Connection failed - check your API key")
        return
    
    # Test with sample image
    test_image = "../dataset/raw-images/biryani/biryani_1.jpg"
    if os.path.exists(test_image):
        print(f"\n📸 Testing detection on: {test_image}")
        result = detector.detect_food(test_image)
        print(json.dumps(result, indent=2))
    else:
        print(f"⚠️ Test image not found: {test_image}")


if __name__ == "__main__":
    test_spoonacular()
