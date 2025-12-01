"""
Demo Food Detection System
Direct image-to-nutrition mapping (no AI model needed)
"""
import cv2
import numpy as np
import hashlib
import json
from pathlib import Path

class DemoFoodMapper:
    def __init__(self):
        self.demo_images_dir = Path(__file__).parent / "demo-images"
        self.mapping_file = self.demo_images_dir / "food_mapping.json"
        self.load_mappings()
    
    def get_image_hash(self, image_path):
        """Get unique hash of image for identification"""
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        # Resize to standard size and convert to grayscale for consistent hashing
        img_resized = cv2.resize(img, (256, 256))
        img_gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        
        # Calculate hash
        return hashlib.md5(img_gray.tobytes()).hexdigest()
    
    def load_mappings(self):
        """Load existing food mappings"""
        if self.mapping_file.exists():
            with open(self.mapping_file, 'r', encoding='utf-8') as f:
                self.mappings = json.load(f)
        else:
            self.mappings = {}
    
    def save_mappings(self):
        """Save food mappings"""
        with open(self.mapping_file, 'w', encoding='utf-8') as f:
            json.dump(self.mappings, f, indent=2, ensure_ascii=False)
    
    def add_demo_image(self, image_path, food_data):
        """
        Add a demo image with its food data
        
        food_data = {
            'name': 'Chicken Biryani',
            'portion_size': 'large',
            'weight_grams': 350,
            'nutrition': {
                'calories': 450,
                'carbohydrates': 60,
                'protein': 18,
                'fat': 15,
                'fiber': 3,
                'sugar': 2,
                'sodium': 650
            },
            'glycemic_index': 58,
            'glycemic_load': 35,
            'glucose_prediction': {
                'peak_time_minutes': 45,
                'peak_increase_mg_dl': 65,
                'duration_hours': 2.5
            }
        }
        """
        img_hash = self.get_image_hash(image_path)
        if img_hash:
            self.mappings[img_hash] = food_data
            self.save_mappings()
            print(f"✅ Added mapping for {food_data['name']}")
            return True
        return False
    
    def detect_food(self, image_path):
        """
        Detect food from demo image
        Returns exact match or None
        """
        img_hash = self.get_image_hash(image_path)
        
        if img_hash in self.mappings:
            food_data = self.mappings[img_hash]
            
            # Format response similar to AI model
            return {
                'success': True,
                'detections': [{
                    'item': food_data['name'].lower().replace(' ', '_'),
                    'display_name': food_data['name'],
                    'confidence': 0.99,  # 99% confidence for exact match
                    'portion_size': food_data['portion_size'],
                    'estimated_weight': food_data['weight_grams'],
                    'nutrition': food_data['nutrition'],
                    'glycemic_index': food_data['glycemic_index'],
                    'glycemic_load': food_data['glycemic_load'],
                    'method': 'demo_mapping'
                }],
                'glucose_prediction': food_data.get('glucose_prediction'),
                'source': 'demo_system',
                'message': 'Exact match from demo database'
            }
        
        return {
            'success': False,
            'error': 'This image is not in the demo database. Please use one of the pre-configured demo images.'
        }
    
    def list_demo_foods(self):
        """List all configured demo foods"""
        foods = []
        for img_hash, data in self.mappings.items():
            foods.append({
                'name': data['name'],
                'portion': data['portion_size'],
                'calories': data['nutrition']['calories']
            })
        return foods


# Pre-configured demo foods database
DEMO_FOODS_DATABASE = {
    'veg_thali_1': {
        'name': 'Vegetarian Thali',
        'portion_size': 'large',
        'weight_grams': 550,
        'nutrition': {
            'calories': 720,
            'carbohydrates': 98,
            'protein': 24,
            'fat': 22,
            'fiber': 14,
            'sugar': 9,
            'sodium': 920
        },
        'glycemic_index': 54,
        'glycemic_load': 53,
        'glucose_prediction': {
            'peak_time_minutes': 60,
            'peak_increase_mg_dl': 68,
            'duration_hours': 3.0,
            'advice': 'Balanced complete meal with high fiber. Good for diabetes management when portion controlled.'
        }
    },
    'idli_sambar_6pc': {
        'name': 'Idli with Sambar (6 pieces)',
        'portion_size': 'large',
        'weight_grams': 320,
        'nutrition': {
            'calories': 380,
            'carbohydrates': 68,
            'protein': 16,
            'fat': 6,
            'fiber': 8,
            'sugar': 3,
            'sodium': 560
        },
        'glycemic_index': 52,
        'glycemic_load': 35,
        'glucose_prediction': {
            'peak_time_minutes': 45,
            'peak_increase_mg_dl': 58,
            'duration_hours': 2.5,
            'advice': 'Excellent choice! Low glycemic load, high protein from sambar helps slow glucose absorption.'
        }
    },
    'veg_thali_2': {
        'name': 'South Indian Thali',
        'portion_size': 'large',
        'weight_grams': 520,
        'nutrition': {
            'calories': 680,
            'carbohydrates': 92,
            'protein': 22,
            'fat': 20,
            'fiber': 12,
            'sugar': 7,
            'sodium': 840
        },
        'glycemic_index': 55,
        'glycemic_load': 51,
        'glucose_prediction': {
            'peak_time_minutes': 55,
            'peak_increase_mg_dl': 65,
            'duration_hours': 2.8,
            'advice': 'Balanced meal with vegetables and dal. Fiber content helps manage glucose spike.'
        }
    },
    'north_indian_thali': {
        'name': 'North Indian Thali',
        'portion_size': 'large',
        'weight_grams': 580,
        'nutrition': {
            'calories': 780,
            'carbohydrates': 105,
            'protein': 28,
            'fat': 26,
            'fiber': 11,
            'sugar': 6,
            'sodium': 1020
        },
        'glycemic_index': 57,
        'glycemic_load': 60,
        'glucose_prediction': {
            'peak_time_minutes': 65,
            'peak_increase_mg_dl': 75,
            'duration_hours': 3.2,
            'advice': 'High calorie and glycemic load. Consider eating half portion or skip the rice/roti to reduce glucose spike.'
        }
    },
    'chicken_biryani': {
        'name': 'Chicken Biryani',
        'portion_size': 'large',
        'weight_grams': 350,
        'nutrition': {
            'calories': 450,
            'carbohydrates': 60,
            'protein': 18,
            'fat': 15,
            'fiber': 3,
            'sugar': 2,
            'sodium': 650
        },
        'glycemic_index': 58,
        'glycemic_load': 35,
        'glucose_prediction': {
            'peak_time_minutes': 45,
            'peak_increase_mg_dl': 65,
            'duration_hours': 2.5,
            'advice': 'Moderate glycemic load. Consider portion control and pair with protein/vegetables.'
        }
    },
    'masala_dosa': {
        'name': 'Masala Dosa',
        'portion_size': 'large',
        'weight_grams': 200,
        'nutrition': {
            'calories': 380,
            'carbohydrates': 55,
            'protein': 8,
            'fat': 14,
            'fiber': 4,
            'sugar': 3,
            'sodium': 450
        },
        'glycemic_index': 66,
        'glycemic_load': 36,
        'glucose_prediction': {
            'peak_time_minutes': 50,
            'peak_increase_mg_dl': 72,
            'duration_hours': 2.0,
            'advice': 'High glycemic load. Eat with sambar (protein) and limit portion size.'
        }
    },
    'idli_sambar': {
        'name': 'Idli with Sambar',
        'portion_size': 'medium',
        'weight_grams': 180,
        'nutrition': {
            'calories': 250,
            'carbohydrates': 45,
            'protein': 10,
            'fat': 5,
            'fiber': 5,
            'sugar': 2,
            'sodium': 380
        },
        'glycemic_index': 50,
        'glycemic_load': 22,
        'glucose_prediction': {
            'peak_time_minutes': 40,
            'peak_increase_mg_dl': 45,
            'duration_hours': 2.0,
            'advice': 'Low glycemic load. Good choice for diabetes management!'
        }
    },
    'plain_rice': {
        'name': 'Plain Rice',
        'portion_size': 'medium',
        'weight_grams': 200,
        'nutrition': {
            'calories': 280,
            'carbohydrates': 62,
            'protein': 5,
            'fat': 0.5,
            'fiber': 1,
            'sugar': 0,
            'sodium': 5
        },
        'glycemic_index': 73,
        'glycemic_load': 45,
        'glucose_prediction': {
            'peak_time_minutes': 35,
            'peak_increase_mg_dl': 85,
            'duration_hours': 1.5,
            'advice': 'High glycemic load. Eat with vegetables and protein to slow absorption.'
        }
    },
    'veg_thali': {
        'name': 'Vegetarian Thali',
        'portion_size': 'large',
        'weight_grams': 500,
        'nutrition': {
            'calories': 680,
            'carbohydrates': 95,
            'protein': 22,
            'fat': 20,
            'fiber': 12,
            'sugar': 8,
            'sodium': 850
        },
        'glycemic_index': 55,
        'glycemic_load': 52,
        'glucose_prediction': {
            'peak_time_minutes': 60,
            'peak_increase_mg_dl': 70,
            'duration_hours': 3.0,
            'advice': 'Balanced meal. High fiber helps slow glucose absorption.'
        }
    }
}


if __name__ == '__main__':
    # Example usage
    mapper = DemoFoodMapper()
    
    print("🎯 Demo Food Mapping System")
    print("=" * 60)
    print("\nConfigured demo foods:")
    for food_id, data in DEMO_FOODS_DATABASE.items():
        print(f"  • {data['name']}")
        print(f"    Calories: {data['nutrition']['calories']} kcal")
        print(f"    Glycemic Load: {data['glycemic_load']}")
        print(f"    Glucose Spike: +{data['glucose_prediction']['peak_increase_mg_dl']} mg/dL\n")
