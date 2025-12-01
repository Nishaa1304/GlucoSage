"""
Feedback Loop System for Model Improvement
Handles user corrections and actual glucose measurements
"""

import json
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class FeedbackSystem:
    """Manages user feedback for continuous model improvement"""
    
    def __init__(self, feedback_file: str = 'feedback_data.jsonl'):
        """
        Initialize feedback system
        
        Args:
            feedback_file: Path to JSONL file storing feedback
        """
        self.feedback_file = Path(feedback_file)
        self.feedback_file.touch(exist_ok=True)
    
    def record_food_correction(
        self,
        image_path: str,
        detected_foods: List[str],
        corrected_foods: List[str],
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Record user correction for food detection
        
        Args:
            image_path: Path to food image
            detected_foods: What the model detected
            corrected_foods: What the user says it actually is
            user_id: User identifier
            
        Returns:
            Feedback entry
        """
        feedback = {
            'type': 'food_correction',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'image_path': image_path,
            'detected_foods': detected_foods,
            'corrected_foods': corrected_foods,
            'corrections_needed': list(set(detected_foods) ^ set(corrected_foods))
        }
        
        self._save_feedback(feedback)
        
        print(f"✅ Food correction recorded:")
        print(f"   Detected: {detected_foods}")
        print(f"   Corrected: {corrected_foods}")
        
        return feedback
    
    def record_glucose_actual(
        self,
        meal_id: str,
        predicted_glucose_1h: float,
        predicted_glucose_2h: float,
        actual_glucose_1h: float = None,
        actual_glucose_2h: float = None,
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Record actual glucose measurements vs predictions
        
        Args:
            meal_id: Unique meal identifier
            predicted_glucose_1h: Model prediction at 1 hour
            predicted_glucose_2h: Model prediction at 2 hours
            actual_glucose_1h: Actual measured glucose at 1 hour
            actual_glucose_2h: Actual measured glucose at 2 hours
            user_id: User identifier
            
        Returns:
            Feedback entry
        """
        feedback = {
            'type': 'glucose_actual',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'meal_id': meal_id,
            'predicted_glucose_1h': predicted_glucose_1h,
            'predicted_glucose_2h': predicted_glucose_2h,
            'actual_glucose_1h': actual_glucose_1h,
            'actual_glucose_2h': actual_glucose_2h
        }
        
        # Calculate errors
        if actual_glucose_1h:
            feedback['error_1h'] = abs(predicted_glucose_1h - actual_glucose_1h)
        if actual_glucose_2h:
            feedback['error_2h'] = abs(predicted_glucose_2h - actual_glucose_2h)
        
        self._save_feedback(feedback)
        
        if actual_glucose_1h:
            print(f"✅ Glucose feedback recorded (1h):")
            print(f"   Predicted: {predicted_glucose_1h} mg/dL")
            print(f"   Actual: {actual_glucose_1h} mg/dL")
            print(f"   Error: {feedback['error_1h']:.1f} mg/dL")
        
        return feedback
    
    def record_portion_correction(
        self,
        food_name: str,
        detected_portion: str,
        corrected_portion: str,
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Record correction for portion size estimation
        
        Args:
            food_name: Name of the food
            detected_portion: Detected portion (small/medium/large)
            corrected_portion: Corrected portion
            user_id: User identifier
            
        Returns:
            Feedback entry
        """
        feedback = {
            'type': 'portion_correction',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'food_name': food_name,
            'detected_portion': detected_portion,
            'corrected_portion': corrected_portion
        }
        
        self._save_feedback(feedback)
        
        print(f"✅ Portion correction recorded for {food_name}")
        
        return feedback
    
    def _save_feedback(self, feedback: Dict[str, Any]):
        """Append feedback to JSONL file"""
        with open(self.feedback_file, 'a') as f:
            f.write(json.dumps(feedback) + '\n')
    
    def get_feedback_summary(self, days: int = 7) -> Dict[str, Any]:
        """
        Get summary of recent feedback
        
        Args:
            days: Number of days to look back
            
        Returns:
            Summary statistics
        """
        feedbacks = self.load_feedback(days=days)
        
        if not feedbacks:
            return {'message': 'No feedback data available'}
        
        df = pd.DataFrame(feedbacks)
        
        summary = {
            'total_feedback': len(df),
            'feedback_types': df['type'].value_counts().to_dict(),
            'recent_days': days
        }
        
        # Food correction stats
        food_corrections = df[df['type'] == 'food_correction']
        if not food_corrections.empty:
            all_corrections = []
            for corrections in food_corrections['corrections_needed']:
                all_corrections.extend(corrections)
            
            from collections import Counter
            most_confused = Counter(all_corrections).most_common(5)
            
            summary['food_corrections'] = {
                'count': len(food_corrections),
                'most_confused_foods': most_confused
            }
        
        # Glucose accuracy stats
        glucose_feedback = df[df['type'] == 'glucose_actual']
        if not glucose_feedback.empty:
            avg_error_1h = glucose_feedback['error_1h'].mean()
            avg_error_2h = glucose_feedback['error_2h'].mean()
            
            summary['glucose_accuracy'] = {
                'count': len(glucose_feedback),
                'avg_error_1h': round(avg_error_1h, 2) if pd.notna(avg_error_1h) else None,
                'avg_error_2h': round(avg_error_2h, 2) if pd.notna(avg_error_2h) else None
            }
        
        # Portion correction stats
        portion_corrections = df[df['type'] == 'portion_correction']
        if not portion_corrections.empty:
            summary['portion_corrections'] = {
                'count': len(portion_corrections),
                'foods_corrected': portion_corrections['food_name'].value_counts().to_dict()
            }
        
        return summary
    
    def load_feedback(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Load recent feedback entries
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of feedback entries
        """
        feedbacks = []
        
        if not self.feedback_file.exists():
            return feedbacks
        
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        
        with open(self.feedback_file, 'r') as f:
            for line in f:
                feedback = json.loads(line.strip())
                feedback_date = datetime.fromisoformat(feedback['timestamp'])
                
                if feedback_date >= cutoff_date:
                    feedbacks.append(feedback)
        
        return feedbacks
    
    def export_for_retraining(self, output_dir: str = './retraining_data'):
        """
        Export feedback data in format suitable for retraining
        
        Args:
            output_dir: Directory to save retraining data
        """
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        feedbacks = self.load_feedback(days=90)  # Last 3 months
        
        if not feedbacks:
            print("No feedback data to export")
            return
        
        df = pd.DataFrame(feedbacks)
        
        # Export food corrections for YOLO retraining
        food_corrections = df[df['type'] == 'food_correction']
        if not food_corrections.empty:
            food_corrections.to_csv(
                output_path / 'food_corrections.csv',
                index=False
            )
            print(f"✅ Exported {len(food_corrections)} food corrections")
        
        # Export glucose data for XGBoost retraining
        glucose_data = df[df['type'] == 'glucose_actual']
        if not glucose_data.empty:
            glucose_data.to_csv(
                output_path / 'glucose_actuals.csv',
                index=False
            )
            print(f"✅ Exported {len(glucose_data)} glucose measurements")
        
        # Export portion corrections
        portion_data = df[df['type'] == 'portion_correction']
        if not portion_data.empty:
            portion_data.to_csv(
                output_path / 'portion_corrections.csv',
                index=False
            )
            print(f"✅ Exported {len(portion_data)} portion corrections")
        
        print(f"\n📁 Retraining data exported to: {output_path}")
        
        return {
            'food_corrections': len(food_corrections) if not food_corrections.empty else 0,
            'glucose_actuals': len(glucose_data) if not glucose_data.empty else 0,
            'portion_corrections': len(portion_data) if not portion_data.empty else 0
        }


# Example usage
if __name__ == "__main__":
    feedback_system = FeedbackSystem()
    
    # Simulate food correction
    feedback_system.record_food_correction(
        image_path='meal_20240115_123045.jpg',
        detected_foods=['roti', 'dal', 'rice'],
        corrected_foods=['paratha', 'dal', 'rice'],  # User corrected roti -> paratha
        user_id='user123'
    )
    
    # Simulate glucose feedback
    feedback_system.record_glucose_actual(
        meal_id='meal_20240115_123045',
        predicted_glucose_1h=145,
        predicted_glucose_2h=165,
        actual_glucose_1h=152,  # User measured actual value
        actual_glucose_2h=170,
        user_id='user123'
    )
    
    # Get summary
    summary = feedback_system.get_feedback_summary(days=7)
    print("\n" + "="*50)
    print("FEEDBACK SUMMARY")
    print("="*50)
    print(json.dumps(summary, indent=2))
    
    # Export for retraining
    export_stats = feedback_system.export_for_retraining()
    print("\n" + "="*50)
    print("EXPORT STATISTICS")
    print("="*50)
    print(json.dumps(export_stats, indent=2))
