#!/usr/bin/env python3
"""
Glucose Data Validator
Checks glucose data quality and readiness for model training
"""

import pandas as pd
from pathlib import Path
import sys

def validate_glucose_data(csv_path: Path):
    """Validate glucose dataset"""
    
    if not csv_path.exists():
        print(f"❌ File not found: {csv_path}")
        return False
    
    print("🔍 Validating glucose data...")
    print()
    
    try:
        # Load data
        df = pd.read_csv(csv_path, comment='#')
        
        print(f"📊 Loaded {len(df)} meal records")
        print()
        
        # Required columns
        required_cols = [
            'date', 'time', 'user_id', 'age', 'diabetes_type', 'medication',
            'food_items', 'portion_size', 'total_carbs_g',
            'pre_meal_glucose', 'glucose_1h', 'glucose_2h'
        ]
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"❌ Missing columns: {', '.join(missing_cols)}")
            return False
        
        print("✅ All required columns present")
        print()
        
        # Check for missing values
        print("📋 Missing Values Check:")
        missing_counts = df[required_cols].isnull().sum()
        has_missing = False
        
        for col in required_cols:
            count = missing_counts[col]
            if count > 0:
                print(f"  ⚠️  {col}: {count} missing")
                has_missing = True
        
        if not has_missing:
            print("  ✅ No missing values")
        print()
        
        # Validate glucose ranges
        print("🩸 Glucose Range Validation:")
        
        checks = [
            ('pre_meal_glucose', 50, 300),
            ('glucose_1h', 50, 400),
            ('glucose_2h', 50, 350),
        ]
        
        all_valid = True
        for col, min_val, max_val in checks:
            invalid = df[(df[col] < min_val) | (df[col] > max_val)]
            if len(invalid) > 0:
                print(f"  ⚠️  {col}: {len(invalid)} values out of range [{min_val}-{max_val}]")
                all_valid = False
            else:
                print(f"  ✅ {col}: All values in range")
        
        if not all_valid:
            print("  💡 Check for data entry errors")
        print()
        
        # User diversity
        print("👥 User Diversity:")
        unique_users = df['user_id'].nunique()
        print(f"  Unique users: {unique_users}")
        
        if unique_users < 5:
            print("  ⚠️  Need at least 5 users for diverse training data")
        elif unique_users < 10:
            print("  🔄 Good start, aim for 10+ users")
        else:
            print("  ✅ Excellent user diversity!")
        print()
        
        # Records per user
        records_per_user = df.groupby('user_id').size()
        print("  Records per user:")
        for user, count in records_per_user.items():
            status = "✅" if count >= 10 else "⚠️"
            print(f"    {status} {user}: {count} records")
        print()
        
        # Diabetes type distribution
        print("💊 Diabetes Type Distribution:")
        diabetes_dist = df['diabetes_type'].value_counts()
        for dtype, count in diabetes_dist.items():
            print(f"  - {dtype}: {count}")
        print()
        
        # Meal time distribution
        print("🕐 Meal Time Distribution:")
        df['hour'] = pd.to_datetime(df['time'], format='%H:%M').dt.hour
        
        morning = len(df[(df['hour'] >= 6) & (df['hour'] < 11)])
        lunch = len(df[(df['hour'] >= 11) & (df['hour'] < 16)])
        dinner = len(df[(df['hour'] >= 16) & (df['hour'] < 22)])
        snacks = len(df) - morning - lunch - dinner
        
        print(f"  Morning (6-11am):   {morning} ({morning/len(df)*100:.1f}%)")
        print(f"  Lunch (11am-4pm):   {lunch} ({lunch/len(df)*100:.1f}%)")
        print(f"  Dinner (4-10pm):    {dinner} ({dinner/len(df)*100:.1f}%)")
        print(f"  Other times:        {snacks} ({snacks/len(df)*100:.1f}%)")
        print()
        
        # Carb distribution
        print("🍚 Carbohydrate Distribution:")
        print(f"  Min:  {df['total_carbs_g'].min():.1f}g")
        print(f"  Mean: {df['total_carbs_g'].mean():.1f}g")
        print(f"  Max:  {df['total_carbs_g'].max():.1f}g")
        print()
        
        # Glucose response patterns
        print("📈 Average Glucose Response:")
        print(f"  Pre-meal:  {df['pre_meal_glucose'].mean():.1f} mg/dL")
        print(f"  1-hour:    {df['glucose_1h'].mean():.1f} mg/dL (Δ{(df['glucose_1h'] - df['pre_meal_glucose']).mean():.1f})")
        print(f"  2-hour:    {df['glucose_2h'].mean():.1f} mg/dL (Δ{(df['glucose_2h'] - df['pre_meal_glucose']).mean():.1f})")
        print()
        
        # Training readiness
        print("=" * 70)
        print("🎓 Training Readiness Assessment")
        print("=" * 70)
        
        issues = []
        warnings = []
        
        if len(df) < 50:
            issues.append(f"Need at least 50 records (have {len(df)})")
        elif len(df) < 100:
            warnings.append(f"Only {len(df)} records - aim for 100+")
        
        if unique_users < 5:
            issues.append(f"Need at least 5 users (have {unique_users})")
        elif unique_users < 10:
            warnings.append(f"Only {unique_users} users - aim for 10+")
        
        if has_missing:
            issues.append("Missing values in required columns")
        
        if not all_valid:
            warnings.append("Some glucose values out of normal range")
        
        if issues:
            print("❌ NOT READY FOR TRAINING")
            print("\nCritical Issues:")
            for issue in issues:
                print(f"  - {issue}")
            print("\n💡 Fix these issues before training")
            return False
        
        elif warnings:
            print("⚠️  MINIMUM REQUIREMENTS MET (but could be better)")
            print("\nRecommendations:")
            for warning in warnings:
                print(f"  - {warning}")
            print("\n✅ Can proceed with training, but more data = better model")
            return True
        
        else:
            print("✅ READY FOR TRAINING!")
            print("\n🎉 Excellent dataset quality")
            print("📝 Next: python glucose-prediction/train_model.py")
            return True
        
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return False

if __name__ == '__main__':
    base_path = Path(__file__).parent.parent
    csv_path = base_path / 'dataset' / 'glucose-data' / 'GLUCOSE_DATA_TEMPLATE.csv'
    
    # Allow custom path as argument
    if len(sys.argv) > 1:
        csv_path = Path(sys.argv[1])
    
    validate_glucose_data(csv_path)
