"""Test if uploaded image is in demo mappings"""
from demo_food_mapper import DemoFoodMapper
import sys

def test_image(image_path):
    mapper = DemoFoodMapper()
    img_hash = mapper.get_image_hash(image_path)
    
    print(f"Image: {image_path}")
    print(f"Hash: {img_hash}")
    print(f"In mapping: {img_hash in mapper.mappings}")
    
    if img_hash in mapper.mappings:
        food = mapper.mappings[img_hash]
        print(f"Food: {food['name']}")
        print(f"Calories: {food['nutrition']['calories']} kcal")
    else:
        print("❌ This image is not in the demo database")
        print("\n💡 To add it, run: python add_uploaded_image_to_demo.py")

if __name__ == '__main__':
    test_image('uploads/food.jpg')
