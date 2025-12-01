"""
XGBoost Glucose Prediction Model
Predicts blood sugar levels 1h and 2h after meal
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from datetime import datetime
from typing import Dict, List, Any, Tuple

class GlucosePredictionModel:
    """XGBoost model for predicting postprandial glucose"""
    
    def __init__(self, model_path: str = None):
        """
        Initialize the prediction model
        
        Args:
            model_path: Path to saved model (if loading existing model)
        """
        self.model_1h = None
        self.model_2h = None
        self.feature_names = []
        self.feature_importance = {}
        
        if model_path:
            self.load_model(model_path)
    
    def prepare_features(self, meal_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Convert meal data to feature vector for prediction
        
        Args:
            meal_data: Dictionary with meal and user information
            
        Returns:
            DataFrame with features ready for prediction
        """
        features = {
            # Meal composition
            'total_carbs': meal_data.get('total_carbs', 0),
            'total_protein': meal_data.get('total_protein', 0),
            'total_fat': meal_data.get('total_fat', 0),
            'total_fiber': meal_data.get('total_fiber', 0),
            'glycemic_load': meal_data.get('glycemic_load', 0),
            'total_calories': meal_data.get('total_calories', 0),
            
            # Carb-protein ratio (important indicator)
            'carb_protein_ratio': meal_data.get('total_carbs', 0) / max(meal_data.get('total_protein', 1), 1),
            
            # Fiber density (g fiber per 100 cal)
            'fiber_density': (meal_data.get('total_fiber', 0) / max(meal_data.get('total_calories', 1), 1)) * 100,
            
            # Time of day encoding
            'hour': self._encode_time(meal_data.get('time_of_day', 'afternoon')),
            'is_morning': 1 if meal_data.get('time_of_day') == 'morning' else 0,
            'is_night': 1 if meal_data.get('time_of_day') == 'night' else 0,
            
            # User profile
            'baseline_glucose': meal_data.get('last_glucose_reading', 100),
            'hours_since_last_meal': meal_data.get('hours_since_last_meal', 4),
            'activity_level': self._encode_activity(meal_data.get('activity_level', 'moderate')),
            'sleep_hours': meal_data.get('sleep_hours_last_night', 7),
            
            # Medical factors
            'diabetes_severity': self._encode_diabetes(meal_data.get('diabetes_type', 'none')),
            'on_medication': 1 if meal_data.get('medication') else 0,
            'medication_effect': self._encode_medication(meal_data.get('medication')),
            
            # Symptoms/conditions
            'stress_level': meal_data.get('stress_level', 3),  # 1-5 scale
            'exercise_before_meal': 1 if meal_data.get('exercised_today', False) else 0,
            'sick_today': 1 if meal_data.get('feeling_sick', False) else 0,
            
            # Historical patterns
            'avg_glucose_last_week': meal_data.get('avg_glucose_last_week', 120),
            'glucose_variability': meal_data.get('glucose_std_last_week', 15),
            
            # Food complexity
            'num_food_items': len(meal_data.get('foods_detected', [])),
            'has_rice': 1 if any('rice' in f or 'biryani' in f or 'pulao' in f 
                                 for f in meal_data.get('foods_detected', [])) else 0,
            'has_dal': 1 if 'dal' in meal_data.get('foods_detected', []) else 0,
            'has_vegetables': 1 if any('sabzi' in f or 'vegetables' in f 
                                       for f in meal_data.get('foods_detected', [])) else 0,
        }
        
        return pd.DataFrame([features])
    
    def _encode_time(self, time_of_day: str) -> int:
        """Encode time of day as hour"""
        mapping = {
            'morning': 8,
            'afternoon': 13,
            'evening': 18,
            'night': 21
        }
        return mapping.get(time_of_day, 13)
    
    def _encode_activity(self, activity_level: str) -> float:
        """Encode activity level"""
        mapping = {
            'sedentary': 1.0,
            'light': 2.0,
            'moderate': 3.0,
            'active': 4.0,
            'veryActive': 5.0
        }
        return mapping.get(activity_level, 3.0)
    
    def _encode_diabetes(self, diabetes_type: str) -> float:
        """Encode diabetes severity"""
        mapping = {
            'none': 0.0,
            'prediabetic': 1.0,
            'type2': 2.0,
            'type1': 3.0
        }
        return mapping.get(diabetes_type, 0.0)
    
    def _encode_medication(self, medication: str) -> float:
        """Encode medication effect strength"""
        if not medication:
            return 0.0
        
        mapping = {
            'metformin': 0.85,
            'insulin': 0.70,
            'sglt2': 0.80,
            'glp1': 0.75
        }
        return mapping.get(medication, 0.0)
    
    def train(
        self, 
        data_path: str,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict[str, Any]:
        """
        Train the XGBoost models on historical data
        
        Args:
            data_path: Path to training CSV file
            test_size: Fraction of data for testing
            random_state: Random seed
            
        Returns:
            Training metrics and performance
        """
        print("📚 Loading training data...")
        df = pd.read_csv(data_path)
        
        # Separate features and targets
        feature_cols = [col for col in df.columns if col not in 
                       ['glucose_1h', 'glucose_2h', 'user_id', 'meal_id', 'timestamp']]
        
        X = df[feature_cols]
        y_1h = df['glucose_1h']
        y_2h = df['glucose_2h']
        
        self.feature_names = feature_cols
        
        # Split data
        X_train, X_test, y_1h_train, y_1h_test, y_2h_train, y_2h_test = train_test_split(
            X, y_1h, y_2h, test_size=test_size, random_state=random_state
        )
        
        print(f"✅ Training set: {len(X_train)} samples")
        print(f"✅ Test set: {len(X_test)} samples")
        
        # Train 1-hour model
        print("\n🔨 Training 1-hour prediction model...")
        self.model_1h = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=random_state,
            objective='reg:squarederror'
        )
        
        self.model_1h.fit(
            X_train, y_1h_train,
            eval_set=[(X_test, y_1h_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Train 2-hour model
        print("🔨 Training 2-hour prediction model...")
        self.model_2h = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=random_state,
            objective='reg:squarederror'
        )
        
        self.model_2h.fit(
            X_train, y_2h_train,
            eval_set=[(X_test, y_2h_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Evaluate models
        print("\n📊 Evaluating models...")
        metrics = self._evaluate_models(X_test, y_1h_test, y_2h_test)
        
        # Feature importance
        self._calculate_feature_importance()
        
        return metrics
    
    def _evaluate_models(
        self, 
        X_test: pd.DataFrame, 
        y_1h_test: pd.Series, 
        y_2h_test: pd.Series
    ) -> Dict[str, Any]:
        """Evaluate model performance"""
        # 1-hour predictions
        y_1h_pred = self.model_1h.predict(X_test)
        mae_1h = mean_absolute_error(y_1h_test, y_1h_pred)
        rmse_1h = np.sqrt(mean_squared_error(y_1h_test, y_1h_pred))
        r2_1h = r2_score(y_1h_test, y_1h_pred)
        
        # 2-hour predictions
        y_2h_pred = self.model_2h.predict(X_test)
        mae_2h = mean_absolute_error(y_2h_test, y_2h_pred)
        rmse_2h = np.sqrt(mean_squared_error(y_2h_test, y_2h_pred))
        r2_2h = r2_score(y_2h_test, y_2h_pred)
        
        metrics = {
            'model_1h': {
                'mae': round(mae_1h, 2),
                'rmse': round(rmse_1h, 2),
                'r2': round(r2_1h, 3)
            },
            'model_2h': {
                'mae': round(mae_2h, 2),
                'rmse': round(rmse_2h, 2),
                'r2': round(r2_2h, 3)
            }
        }
        
        print("\n✅ 1-Hour Model Performance:")
        print(f"   MAE: {mae_1h:.2f} mg/dL")
        print(f"   RMSE: {rmse_1h:.2f} mg/dL")
        print(f"   R²: {r2_1h:.3f}")
        
        print("\n✅ 2-Hour Model Performance:")
        print(f"   MAE: {mae_2h:.2f} mg/dL")
        print(f"   RMSE: {rmse_2h:.2f} mg/dL")
        print(f"   R²: {r2_2h:.3f}")
        
        return metrics
    
    def _calculate_feature_importance(self):
        """Calculate and store feature importance"""
        importance_1h = self.model_1h.feature_importances_
        importance_2h = self.model_2h.feature_importances_
        
        # Average importance across both models
        avg_importance = (importance_1h + importance_2h) / 2
        
        self.feature_importance = {
            name: round(float(imp), 4) 
            for name, imp in zip(self.feature_names, avg_importance)
        }
        
        # Sort by importance
        sorted_features = sorted(
            self.feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        print("\n🔝 Top 10 Important Features:")
        for i, (feature, importance) in enumerate(sorted_features[:10], 1):
            print(f"   {i}. {feature}: {importance:.4f}")
    
    def predict(self, meal_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict glucose levels after meal
        
        Args:
            meal_data: Dictionary with meal and user information
            
        Returns:
            Predictions with confidence intervals
        """
        if not self.model_1h or not self.model_2h:
            raise ValueError("Models not trained. Train or load models first.")
        
        # Prepare features
        X = self.prepare_features(meal_data)
        
        # Predict
        glucose_1h = self.model_1h.predict(X)[0]
        glucose_2h = self.model_2h.predict(X)[0]
        
        # Calculate risk level
        baseline = meal_data.get('last_glucose_reading', 100)
        spike_1h = glucose_1h - baseline
        spike_2h = glucose_2h - baseline
        
        # Risk classification
        if glucose_2h < 140:
            risk = "low"
        elif glucose_2h < 180:
            risk = "moderate"
        else:
            risk = "high"
        
        return {
            'baseline_glucose': round(baseline, 0),
            'predicted_glucose_1h': round(glucose_1h, 0),
            'predicted_glucose_2h': round(glucose_2h, 0),
            'glucose_spike_1h': round(spike_1h, 0),
            'glucose_spike_2h': round(spike_2h, 0),
            'peak_time': '1 hour' if glucose_1h > glucose_2h else '2 hours',
            'risk_level': risk,
            'confidence': self._calculate_confidence(X),
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, X: pd.DataFrame) -> str:
        """Estimate prediction confidence based on feature values"""
        # Simple heuristic: check if features are within typical ranges
        # In production, use proper uncertainty quantification
        
        # For now, return medium confidence
        # TODO: Implement proper confidence intervals
        return "medium"
    
    def save_model(self, path: str):
        """Save trained models to disk"""
        model_data = {
            'model_1h': self.model_1h,
            'model_2h': self.model_2h,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance,
            'version': '1.0',
            'trained_date': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, path)
        print(f"✅ Models saved to: {path}")
    
    def load_model(self, path: str):
        """Load trained models from disk"""
        model_data = joblib.load(path)
        
        self.model_1h = model_data['model_1h']
        self.model_2h = model_data['model_2h']
        self.feature_names = model_data['feature_names']
        self.feature_importance = model_data['feature_importance']
        
        print(f"✅ Models loaded from: {path}")
        print(f"   Version: {model_data.get('version', 'unknown')}")
        print(f"   Trained: {model_data.get('trained_date', 'unknown')}")


def generate_sample_dataset(output_path: str, num_samples: int = 1000):
    """
    Generate synthetic training data for demonstration
    
    In production, use real user data with actual glucose measurements
    """
    np.random.seed(42)
    
    data = []
    
    for i in range(num_samples):
        # Generate random meal
        carbs = np.random.uniform(20, 80)
        protein = np.random.uniform(5, 30)
        fat = np.random.uniform(2, 25)
        fiber = np.random.uniform(1, 15)
        gl = np.random.uniform(10, 40)
        calories = carbs * 4 + protein * 4 + fat * 9
        
        # User profile
        baseline_glucose = np.random.uniform(80, 140)
        diabetes_severity = np.random.choice([0, 1, 2, 3], p=[0.5, 0.3, 0.15, 0.05])
        activity_level = np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.2, 0.4, 0.2, 0.1])
        
        # Time factors
        hour = np.random.choice([8, 13, 18, 21], p=[0.25, 0.35, 0.25, 0.15])
        is_morning = 1 if hour == 8 else 0
        is_night = 1 if hour == 21 else 0
        
        # Simulate glucose response
        # This is a simplified model for demonstration
        base_spike = gl * 3.5
        time_factor = 1.2 if hour > 18 else 1.0
        diabetes_factor = 1 + (diabetes_severity * 0.15)
        activity_factor = 1.1 - (activity_level * 0.02)
        
        glucose_1h = baseline_glucose + (base_spike * 0.8 * time_factor * diabetes_factor * activity_factor)
        glucose_2h = baseline_glucose + (base_spike * 1.0 * time_factor * diabetes_factor * activity_factor)
        
        # Add noise
        glucose_1h += np.random.normal(0, 10)
        glucose_2h += np.random.normal(0, 12)
        
        sample = {
            'total_carbs': carbs,
            'total_protein': protein,
            'total_fat': fat,
            'total_fiber': fiber,
            'glycemic_load': gl,
            'total_calories': calories,
            'carb_protein_ratio': carbs / max(protein, 1),
            'fiber_density': (fiber / max(calories, 1)) * 100,
            'hour': hour,
            'is_morning': is_morning,
            'is_night': is_night,
            'baseline_glucose': baseline_glucose,
            'hours_since_last_meal': np.random.uniform(2, 8),
            'activity_level': activity_level,
            'sleep_hours': np.random.uniform(5, 9),
            'diabetes_severity': diabetes_severity,
            'on_medication': np.random.choice([0, 1], p=[0.6, 0.4]),
            'medication_effect': np.random.choice([0, 0.7, 0.8, 0.85]),
            'stress_level': np.random.randint(1, 6),
            'exercise_before_meal': np.random.choice([0, 1], p=[0.7, 0.3]),
            'sick_today': np.random.choice([0, 1], p=[0.9, 0.1]),
            'avg_glucose_last_week': np.random.uniform(100, 150),
            'glucose_variability': np.random.uniform(10, 30),
            'num_food_items': np.random.randint(1, 7),
            'has_rice': np.random.choice([0, 1], p=[0.5, 0.5]),
            'has_dal': np.random.choice([0, 1], p=[0.6, 0.4]),
            'has_vegetables': np.random.choice([0, 1], p=[0.4, 0.6]),
            'glucose_1h': max(80, min(300, glucose_1h)),
            'glucose_2h': max(80, min(300, glucose_2h))
        }
        
        data.append(sample)
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"✅ Generated {num_samples} samples → {output_path}")
    return df


# Example usage
if __name__ == "__main__":
    # Generate sample dataset
    print("📝 Generating sample training data...")
    train_data = generate_sample_dataset('training_data.csv', num_samples=2000)
    
    # Train model
    print("\n🎓 Training prediction models...")
    model = GlucosePredictionModel()
    metrics = model.train('training_data.csv')
    
    # Save model
    model.save_model('glucose_prediction_model.pkl')
    
    # Test prediction
    print("\n🧪 Testing prediction...")
    test_meal = {
        'total_carbs': 55,
        'total_protein': 12,
        'total_fat': 8,
        'total_fiber': 5,
        'glycemic_load': 28,
        'total_calories': 340,
        'time_of_day': 'afternoon',
        'last_glucose_reading': 110,
        'hours_since_last_meal': 4,
        'activity_level': 'moderate',
        'sleep_hours_last_night': 7,
        'diabetes_type': 'prediabetic',
        'medication': None,
        'stress_level': 3,
        'exercised_today': False,
        'feeling_sick': False,
        'avg_glucose_last_week': 125,
        'glucose_std_last_week': 18,
        'foods_detected': ['rice', 'dal', 'sabzi']
    }
    
    prediction = model.predict(test_meal)
    print("\n" + "="*50)
    print("PREDICTION RESULTS")
    print("="*50)
    print(json.dumps(prediction, indent=2))
