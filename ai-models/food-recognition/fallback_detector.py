"""
Fallback Food Detector
Uses color analysis and generic patterns to detect common food items
that aren't in the trained model
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple

class FallbackFoodDetector:
    """Detect generic food categories using color and texture analysis"""
    
    def __init__(self):
        # Color ranges in HSV for common foods
        self.color_patterns = {
            'dal': {
                'colors': [(15, 100, 100), (30, 255, 255)],  # Yellow/Orange
                'name': 'dal',
                'confidence': 0.6
            },
            'raita': {
                'colors': [(0, 0, 200), (180, 30, 255)],  # White/Cream
                'name': 'raita',
                'confidence': 0.5
            },
            'paneer_curry': {
                'colors': [(10, 50, 100), (25, 200, 255)],  # Orange/Red gravy
                'name': 'paneer_curry',
                'confidence': 0.55
            },
            'sabzi': {
                'colors': [(35, 40, 40), (85, 255, 255)],  # Green vegetables
                'name': 'sabzi',
                'confidence': 0.5
            },
            'chole': {
                'colors': [(5, 80, 80), (20, 255, 200)],  # Brown/Orange
                'name': 'chole',
                'confidence': 0.5
            },
            'gulab_jamun': {
                'colors': [(0, 100, 50), (10, 255, 150)],  # Dark brown/red
                'name': 'gulab_jamun',
                'confidence': 0.5
            }
        }
        
        # Texture patterns (simplified)
        self.texture_hints = {
            'round_balls': ['gulab_jamun'],
            'grainy': ['dal', 'chole', 'rajma'],
            'chunks': ['paneer_curry', 'sabzi'],
            'creamy': ['raita', 'curry']
        }
    
    def detect_by_color(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Analyze image colors to detect common food items
        
        Args:
            image_path: Path to food image
            
        Returns:
            List of detected food items with confidence scores
        """
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return []
        
        # Convert to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        height, width = img.shape[:2]
        
        detections = []
        
        # Divide image into grid to find different items
        grid_size = 4
        cell_h = height // grid_size
        cell_w = width // grid_size
        
        detected_items = set()
        
        for i in range(grid_size):
            for j in range(grid_size):
                # Get cell region
                y1 = i * cell_h
                y2 = (i + 1) * cell_h
                x1 = j * cell_w
                x2 = (j + 1) * cell_w
                
                cell = hsv[y1:y2, x1:x2]
                
                # Check each food pattern
                for food_key, pattern in self.color_patterns.items():
                    if food_key in detected_items:
                        continue
                    
                    # Create mask for this color range
                    lower = np.array(pattern['colors'][0])
                    upper = np.array(pattern['colors'][1])
                    mask = cv2.inRange(cell, lower, upper)
                    
                    # Calculate percentage of matching pixels
                    match_ratio = np.sum(mask > 0) / mask.size
                    
                    # If significant portion matches
                    if match_ratio > 0.15:  # 15% of cell
                        detected_items.add(food_key)
                        
                        detections.append({
                            'item': pattern['name'],
                            'confidence': min(pattern['confidence'] + match_ratio * 0.2, 0.85),
                            'bounding_box': [x1, y1, x2, y2],
                            'box_area': (x2 - x1) * (y2 - y1),
                            'portion_size': 'medium',
                            'estimated_weight': 120.0,
                            'detection_method': 'color_fallback'
                        })
                        break
        
        return detections
    
    def merge_detections(
        self, 
        primary_detections: List[Dict], 
        fallback_detections: List[Dict]
    ) -> List[Dict]:
        """
        Merge trained model detections with fallback detections
        
        Args:
            primary_detections: From trained YOLO model
            fallback_detections: From color analysis
            
        Returns:
            Combined list of detections
        """
        # Start with primary detections
        merged = primary_detections.copy()
        
        # Add fallback detections that don't overlap significantly
        for fallback in fallback_detections:
            fb_box = fallback['bounding_box']
            
            # Check overlap with primary detections
            has_overlap = False
            for primary in primary_detections:
                p_box = primary['bounding_box']
                
                # Calculate IoU
                iou = self._calculate_iou(fb_box, p_box)
                if iou > 0.3:  # 30% overlap threshold
                    has_overlap = True
                    break
            
            if not has_overlap:
                merged.append(fallback)
        
        return merged
    
    def _calculate_iou(self, box1: List[int], box2: List[int]) -> float:
        """Calculate Intersection over Union"""
        x1_1, y1_1, x2_1, y2_1 = box1
        x1_2, y1_2, x2_2, y2_2 = box2
        
        # Intersection
        xi1 = max(x1_1, x1_2)
        yi1 = max(y1_1, y1_2)
        xi2 = min(x2_1, x2_2)
        yi2 = min(y2_1, y2_2)
        
        inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
        
        # Union
        box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
        box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
        union_area = box1_area + box2_area - inter_area
        
        return inter_area / union_area if union_area > 0 else 0
