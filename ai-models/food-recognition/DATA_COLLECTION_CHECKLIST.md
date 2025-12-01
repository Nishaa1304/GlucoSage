# 📸 Data Collection Checklist - Week 1-2

## 🎯 Goal: 300 images per food × 15 foods = 4,500 total images

---

## ✅ Phase 1: Setup (Day 1)

### 1.1 Create Folder Structure
```
ai-models/
├── dataset/
│   ├── raw-images/           # Original photos go here
│   │   ├── roti/
│   │   ├── dal/
│   │   ├── rice/
│   │   ├── biryani/
│   │   ├── curry/
│   │   ├── idli/
│   │   ├── dosa/
│   │   ├── paratha/
│   │   ├── samosa/
│   │   ├── paneer/
│   │   ├── chole/
│   │   ├── raita/
│   │   ├── salad/
│   │   ├── thali/            # Multiple foods together
│   │   └── mixed/            # Complex meal combinations
│   ├── roboflow-export/      # Labeled data from Roboflow
│   └── training-data/        # Final YOLOv8 format
└── training-notebooks/
    └── dataset-validation.ipynb
```

**Action:** Run the setup script (created below)

---

## 📸 Phase 2: Image Collection (Days 2-10)

### 2.1 Daily Collection Target
- **10 days × 450 images/day = 4,500 images**
- **~30 images per food per day**

### 2.2 Collection Guidelines

#### **Diversity Checklist** (for EACH food):
- [ ] **Lighting:** Morning, afternoon, evening, artificial
- [ ] **Angles:** Top-down (45°), side (30°), overhead (90°)
- [ ] **Backgrounds:** Plate, table, thali, restaurant, home
- [ ] **Portions:** Small (1 piece), Medium (2-3), Large (full plate)
- [ ] **Serving styles:** 
  - Traditional (banana leaf, steel plate)
  - Modern (ceramic, glass)
  - Casual (plastic, food court)
- [ ] **Contexts:**
  - Solo (single food item)
  - Combo (2-3 items)
  - Thali (5+ items)
  - Restaurant presentation
  - Home cooking

#### **Quality Checks:**
- ✅ In focus (not blurry)
- ✅ Well-lit (not too dark/bright)
- ✅ Food is main subject (70%+ of frame)
- ✅ Food clearly visible (not covered)
- ✅ Natural appearance (not edited)

---

## 📊 Phase 3: Roboflow Setup (Day 1)

### 3.1 Create Account
1. Go to [roboflow.com](https://roboflow.com)
2. Sign up (free tier: 10,000 images)
3. Create new workspace: "GlucoSage"

### 3.2 Create Project
```
Project Name: indian-food-detection
Project Type: Object Detection
Annotation Group: Food Items
License: Private
```

### 3.3 Configure Classes (15 total)
```
1. roti
2. dal
3. rice
4. biryani
5. curry
6. idli
7. dosa
8. paratha
9. samosa
10. paneer_dish
11. chole
12. raita
13. salad
14. sabzi (vegetables)
15. sweet (dessert)
```

### 3.4 Upload Settings
- Image format: JPG/PNG
- Max dimension: 1280px (auto-resize)
- Keep originals: Yes

---

## 🏷️ Phase 4: Labeling (Days 3-14)

### 4.1 Roboflow Annotation
1. Upload 50-100 images at a time
2. Use Roboflow's labeling tool
3. Draw bounding boxes around each food item
4. Assign correct class label

### 4.2 Labeling Best Practices

#### **Bounding Box Rules:**
- **Tight fit:** Box edges 2-5 pixels from food
- **Capture all:** Include garnish, sauce, entire portion
- **No overlap:** If foods touching, separate clearly
- **Occlusion:** If >70% hidden, don't label

#### **Quality Targets:**
- Precision: Box should be 90%+ accurate
- Coverage: Label ALL visible food items
- Consistency: Same food = same label

### 4.3 Daily Labeling Target
- **200-300 images/day** (10-15 minutes per batch of 50)
- Use Roboflow's smart tools:
  - Auto-annotate (after 50+ labeled)
  - Copy annotations
  - Batch operations

---

## 🤖 Phase 5: Dataset Preparation (Day 15)

### 5.1 Roboflow Preprocessing
```
Settings to enable:
✅ Auto-Orient: Yes
✅ Resize: 640×640 (YOLOv8 standard)
✅ Grayscale: No
✅ Auto-Contrast: No (keep natural)
```

### 5.2 Data Augmentation (for training)
```
Augmentations:
✅ Flip: Horizontal only
✅ Rotation: ±15°
✅ Crop: 0-10%
✅ Brightness: ±15%
✅ Blur: Up to 1px
✅ Cutout: 3 boxes, 5% size

Generate: 2× augmented versions = 9,000 training images
```

### 5.3 Train/Val/Test Split
```
Training:   70% (3,150 images)
Validation: 20% (900 images)
Test:       10% (450 images)
```

### 5.4 Export to YOLOv8
1. Click "Export Dataset"
2. Format: **YOLOv8**
3. Download zip file
4. Extract to: `ai-models/dataset/roboflow-export/`

---

## 📈 Phase 6: Glucose Data Collection (Parallel)

### 6.1 Data Collection Template (Excel/Google Sheets)

| Date | Time | Food Items | Portion Size | Carbs (g) | Pre-meal Glucose | 1h Post | 2h Post | Activity | Notes |
|------|------|------------|--------------|-----------|------------------|---------|---------|----------|-------|
| 2025-11-30 | 08:00 | Idli (3), Sambar (1 bowl) | Medium | 60 | 95 | 145 | 120 | Walking 15min | Felt good |

### 6.2 Minimum Data Requirements
- **100 meal records** (enough for initial model)
- **10 users** (diverse: age, diabetes type, activity)
- **Variety:** Breakfast, lunch, dinner, snacks

### 6.3 Ethical & Safe Collection
⚠️ **Important:**
- Get informed consent
- Follow medical guidelines
- No changes to medication
- Doctor approval if Type 1 diabetic
- Emergency contact ready

---

## ✅ Progress Tracking

### Daily Checklist
```
□ Day 1:  Setup folders + Roboflow account
□ Day 2:  Collect 450 images (30 per food)
□ Day 3:  Collect 450 + Label 200 from Day 2
□ Day 4:  Collect 450 + Label 400
□ Day 5:  Collect 450 + Label 400
□ Day 6:  Collect 450 + Label 400
□ Day 7:  Rest / Catch up on labeling
□ Day 8:  Collect 450 + Label 400
□ Day 9:  Collect 450 + Label 400
□ Day 10: Collect 450 + Label 400
□ Day 11: Label remaining images
□ Day 12: Quality check + Augmentation setup
□ Day 13: Export dataset + Validation
□ Day 14: Buffer day / Final checks
```

### Milestones
- ✅ 1,500 images collected (Day 5)
- ✅ 3,000 images collected (Day 8)
- ✅ 4,500 images collected (Day 10)
- ✅ All images labeled (Day 11)
- ✅ Dataset exported (Day 13)

---

## 🚨 Common Issues & Solutions

### Issue 1: Not Enough Images
**Solution:** 
- Use Google Images (free, Creative Commons)
- Visit restaurants with permission
- Ask friends/family to contribute
- Use food delivery app photos (with permission)

### Issue 2: Labeling Too Slow
**Solution:**
- Use Roboflow's auto-annotate after 50 images
- Label in batches of similar images
- Use keyboard shortcuts (B for box, Enter to save)

### Issue 3: Poor Image Quality
**Solution:**
- Use good smartphone camera (8MP+)
- Natural daylight is best
- Steady hands or tripod
- Clean plate/background

### Issue 4: Can't Find Specific Food
**Solution:**
- Start with what's available
- Focus on 10 foods initially
- Add rare foods later (transfer learning)

---

## 📞 Need Help?

### Resources:
- **Roboflow Docs:** [docs.roboflow.com](https://docs.roboflow.com)
- **YOLOv8 Docs:** [docs.ultralytics.com](https://docs.ultralytics.com)
- **Our Guide:** `DATASET_GUIDE.md`

### Quick Commands:
```bash
# Count images in folder
Get-ChildItem -Path "dataset/raw-images/roti" | Measure-Object

# Validate image formats
python scripts/validate_images.py

# Check dataset stats
python scripts/dataset_stats.py
```

---

## 🎯 Success Criteria

### You're ready to train when:
- ✅ 4,000+ images collected (allow some bad ones)
- ✅ 15 food classes represented
- ✅ All images labeled with bounding boxes
- ✅ Dataset exported in YOLOv8 format
- ✅ Train/val/test split configured
- ✅ At least 50 glucose meal records

**Then proceed to:** `TRAINING_GUIDE.md` (Week 2, Days 15-21)

---

Good luck! 🚀 This is the hardest part, but once done, training is automated!
