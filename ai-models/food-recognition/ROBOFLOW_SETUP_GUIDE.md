# 🏷️ Roboflow Setup & Labeling Guide

## 📋 Complete step-by-step guide for Roboflow

---

## 🚀 Part 1: Account Setup

### Step 1: Create Account

1. **Go to Roboflow:**
   - Visit: [app.roboflow.com](https://app.roboflow.com)
   - Click "Sign Up"

2. **Choose plan:**
   - Select: **Public (Free)**
   - Includes: 10,000 images
   - Perfect for our project!

3. **Sign up with:**
   - Google account (easiest)
   - Email/password
   - GitHub

4. **Verify email** and log in

---

### Step 2: Create Workspace

1. **After login:**
   - Click "Create Workspace"
   - Name: `GlucoSage` or `YourName-FoodAI`

2. **Workspace settings:**
   - Type: Personal/Team
   - Public: Yes (for free tier)

---

### Step 3: Create Project

1. **Click "Create New Project"**

2. **Project Configuration:**
   ```
   Project Name: indian-food-detection
   
   Project Type: Object Detection ⭐
   (NOT Image Classification!)
   
   What will your model predict?: Food Items
   
   Annotation Group: Food
   
   License: MIT (if public) or Private
   ```

3. **Click "Create Project"**

---

## 🎯 Part 2: Configure Classes

### Step 4: Add Classes

You'll see "Add Classes" screen. Add these **15 classes** exactly:

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
14. sabzi
15. sweet
```

**Important:**
- Use **lowercase**
- Use **underscores** (not spaces)
- Match these names exactly (for consistency)

---

## 📤 Part 3: Upload Images

### Step 5: First Upload

1. **Click "Upload" (top right)**

2. **Choose images:**
   - Click "Select Images"
   - Navigate to: `ai-models\dataset\raw-images\roti\`
   - Select 50-100 images
   - Click "Upload"

3. **Upload settings:**
   - Auto-Orient: ✅ Yes
   - Duplicate Detection: ✅ Yes
   - Max Image Size: 1280px (auto-resize)

4. **Start upload** (may take 2-5 minutes)

### Step 6: Organize Batches

**Best practice:** Upload in batches by food class

Day 3:
- Upload roti images (all 300)
- Upload dal images (all 300)

Day 4:
- Upload rice images (all 300)
- Upload curry images (all 300)

This makes labeling easier!

---

## 🏷️ Part 4: Labeling/Annotation

### Step 7: Start Annotating

1. **Click "Annotate"** (left sidebar)

2. **You'll see:**
   - Image in center
   - Classes on right
   - Tools on top

### Step 8: Draw Bounding Boxes

**For each image:**

1. **Select class** (from right panel)
   - Example: Click "roti"

2. **Draw box:**
   - Click "B" (or click box icon)
   - Click-drag around the food item
   - Make box tight (2-5px from edges)
   - Release mouse

3. **Adjust if needed:**
   - Drag corners to resize
   - Drag center to move

4. **Label ALL food items:**
   - If image has roti + dal:
     - Draw box around roti (label: roti)
     - Draw box around dal (label: dal)

5. **Save:**
   - Click "Save" or press Enter
   - Move to next image

---

## 📏 Labeling Best Practices

### ✅ Good Bounding Boxes:

**Rule 1: Tight Fit**
```
✅ GOOD:
┌─────────────┐
│  [  Roti  ] │  ← 2-5px gap
└─────────────┘

❌ BAD:
┌──────────────────┐
│                  │
│    [  Roti  ]    │  ← Too much space
│                  │
└──────────────────┘
```

**Rule 2: Include Everything**
```
✅ Include:
- Entire food item
- Garnish (coriander on curry)
- Sauce/gravy
- Visible portions

❌ Don't include:
- Plate edges (unless food is very close)
- Utensils
- Other objects
```

**Rule 3: Overlapping Foods**
```
If foods are touching:
- Draw separate boxes
- Boxes can overlap slightly
- Label each correctly

Example: Roti on rice
┌────────┐
│ [Roti] │
│  ┌────┼─────┐
│  │Rice│     │
└──┼────┘     │
   └──────────┘
```

**Rule 4: Occlusion (Hidden)**
```
If >30% visible: ✅ Label it
If <30% visible: ❌ Skip it

Example: Dal bowl mostly hidden by roti
→ Skip the dal, only label visible roti
```

---

## ⌨️ Keyboard Shortcuts

Speed up labeling with shortcuts:

```
B       → Box tool (start drawing)
Enter   → Save and next image
A       → Previous image
D       → Next image
Del     → Delete selected box
C       → Copy box (for similar images)
V       → Paste box
1-9     → Select class by number
Space   → Toggle pan mode
```

**Pro tip:** Use keyboard primarily, mouse only for drawing!

---

## 🤖 Part 5: Smart Labeling (After 50 images)

### Step 9: Enable Auto-Annotate

Once you've labeled **50+ images**:

1. **Click "Auto-Label"** (top bar)

2. **Roboflow AI will:**
   - Detect food items automatically
   - Draw boxes
   - Suggest labels

3. **Your job:**
   - Review suggestions
   - Correct mistakes
   - Adjust boxes
   - Confirm labels

**This can 3× your speed!**

### Step 10: Use Label Assist

**For similar images:**

1. Label first image in batch
2. Click "Copy Annotations"
3. Paste to similar images
4. Adjust as needed

**Example:** 10 images of roti on plate
- Label first one carefully
- Copy to others
- Adjust positions

---

## 📊 Part 6: Quality Checks

### Step 11: Review Annotations

1. **Click "Annotate" → "Review"**

2. **Check for:**
   - Missing labels (unlabeled food)
   - Wrong labels (roti labeled as dal)
   - Poor boxes (too loose/tight)
   - Duplicate boxes

3. **Fix issues:**
   - Click image
   - Edit labels
   - Re-save

---

## 🔧 Part 7: Dataset Configuration

### Step 12: Add Preprocessing

1. **Click "Generate" → "Add Preprocessing Steps"**

2. **Enable these:**
   ```
   ✅ Auto-Orient: Yes
      (Fixes rotated images)
   
   ✅ Resize: Fit within 640×640
      (YOLOv8 standard size)
   
   ✅ Grayscale: No
      (Keep colors!)
   
   ✅ Contrast: No
      (Keep natural look)
   ```

3. **Click "Continue"**

---

### Step 13: Add Augmentations

**Augmentations = artificial variety**

1. **Click "Add Augmentation Step"**

2. **Recommended settings:**
   ```
   ✅ Flip: Horizontal only
      (Food usually upright)
   
   ✅ Rotation: ±15 degrees
      (Slight angle variations)
   
   ✅ Crop: 0-10%
      (Zoom variety)
   
   ✅ Shear: ±5 degrees
      (Perspective changes)
   
   ✅ Brightness: ±15%
      (Lighting variations)
   
   ✅ Blur: Up to 1.0px
      (Camera shake simulation)
   
   ✅ Cutout: 3 boxes, 5% size each
      (Occlusion simulation)
   ```

3. **Generate:** 2× augmented
   - Original: 4,500 images
   - Augmented: 9,000 images
   - Total training: 13,500 images! 🎉

---

### Step 14: Train/Val/Test Split

1. **Configure split:**
   ```
   Training:   70% (9,450 images)
   Validation: 20% (2,700 images)
   Test:       10% (1,350 images)
   ```

2. **Options:**
   - Random split: ✅ Yes
   - Stratified: ✅ Yes (balanced per class)

---

## 📦 Part 8: Export Dataset

### Step 15: Export for YOLOv8

1. **Click "Export Dataset"**

2. **Format:** YOLOv8 ⭐
   (NOT YOLOv5, NOT COCO!)

3. **Download:** Click "Download ZIP"

4. **File structure will be:**
   ```
   indian-food-detection.v1-yolov8.zip
   ├── data.yaml (classes config)
   ├── train/
   │   ├── images/
   │   └── labels/
   ├── valid/
   │   ├── images/
   │   └── labels/
   └── test/
       ├── images/
       └── labels/
   ```

---

### Step 16: Extract to Project

1. **Extract ZIP:**
   ```powershell
   cd d:\Yukti\glucosage\ai-models
   Expand-Archive -Path "Downloads\indian-food-detection.v1-yolov8.zip" -DestinationPath "dataset\roboflow-export"
   ```

2. **Verify structure:**
   ```powershell
   ls dataset\roboflow-export
   ```

3. **You should see:**
   - `data.yaml`
   - `train/`, `valid/`, `test/` folders

---

## 📊 Part 9: Dataset Health Check

### Step 17: Review Dataset

In Roboflow, click **"Health Check":**

**It will show:**
- Class balance (images per class)
- Annotation quality
- Image quality issues
- Recommendations

**Aim for:**
- ✅ All classes: 250+ images
- ✅ Class balance: ±20%
- ✅ No major quality issues

---

## 🎯 Labeling Progress Tracking

### Daily Targets:

| Day | Upload | Label | Total Labeled |
|-----|--------|-------|---------------|
| 3   | 600    | 200   | 200           |
| 4   | 600    | 400   | 600           |
| 5   | 600    | 400   | 1,000         |
| 6   | 600    | 400   | 1,400         |
| 7   | 600    | 400   | 1,800         |
| 8   | 600    | 400   | 2,200         |
| 9   | 600    | 400   | 2,600         |
| 10  | 600    | 400   | 3,000         |
| 11  | 0      | 600   | 3,600         |
| 12  | 0      | 900   | 4,500 ✅      |

**Estimate:** 15-20 minutes per 50 images

---

## 🚨 Common Issues & Solutions

### Issue 1: "Upload limit reached"
**Solution:**
- Free tier: 10,000 images
- Use Public workspace
- Or upgrade to paid plan

### Issue 2: "Labeling too slow"
**Solution:**
- Use auto-annotate (after 50)
- Label similar images together
- Take breaks (accuracy matters!)

### Issue 3: "Can't see food clearly"
**Solution:**
- Skip low-quality images
- Re-collect if needed
- Quality > quantity

### Issue 4: "Multiple foods overlapping"
**Solution:**
- Label each separately
- Boxes can overlap
- Be consistent

---

## ✅ Final Checklist

Before exporting, verify:

- [ ] All 4,500+ images uploaded
- [ ] All images labeled
- [ ] All 15 classes have 250+ images
- [ ] Preprocessing configured
- [ ] Augmentations configured
- [ ] Train/val/test split set
- [ ] Health check passed
- [ ] Exported in YOLOv8 format
- [ ] ZIP downloaded
- [ ] Extracted to project folder

---

## 🎉 Ready to Train!

Once exported:

1. ✅ Dataset is ready
2. ✅ Proceed to `TRAINING_GUIDE.md`
3. ✅ Train YOLOv8 model

---

## 📞 Resources

- **Roboflow Docs:** [docs.roboflow.com](https://docs.roboflow.com)
- **Video Tutorial:** [youtube.com/roboflow](https://youtube.com/roboflow)
- **Community:** [discuss.roboflow.com](https://discuss.roboflow.com)

---

**Questions? Issues? Check Roboflow docs or ask in their community forum!** 🚀
