# 🚀 Quick Start Guide: Data Collection (Week 1-2)

## 📅 Your 2-Week Plan

### **Day 1: Setup (30 minutes)**

1. **Create folder structure:**
   ```powershell
   cd d:\Yukti\glucosage\ai-models
   python scripts\setup_dataset_folders.py
   ```

2. **Sign up for Roboflow:**
   - Go to [roboflow.com](https://roboflow.com)
   - Create account (FREE tier)
   - Create workspace: "GlucoSage"
   - Create project: "indian-food-detection"
   - Set type: Object Detection
   - Add 15 classes (roti, dal, rice, etc.)

3. **Review guides:**
   - Read: `DATA_COLLECTION_CHECKLIST.md`
   - Keep handy while collecting

---

### **Days 2-10: Collect Images (450/day)**

#### **Daily Routine:**

**Morning (30 min):** 150 images
- Breakfast photos (home)
- Restaurant breakfast
- Street food

**Afternoon (30 min):** 150 images
- Lunch at restaurants
- Office cafeteria
- Home cooking

**Evening (30 min):** 150 images
- Dinner preparation
- Restaurant dinner
- Food delivery

#### **Pro Tips:**
✅ Use your smartphone (8MP+ camera)
✅ Natural lighting is best
✅ Take 3 angles per dish (top, side, 45°)
✅ Include context (plate, thali, table)
✅ Vary backgrounds and presentations

#### **Track Progress:**
```powershell
# Run this daily to check progress
python scripts\dataset_stats.py
```

---

### **Days 3-14: Label Images (Parallel)**

#### **Upload to Roboflow (Day 3 onwards):**

1. **Daily uploads:**
   - Upload 200-300 images at a time
   - Group by food type for easier labeling

2. **Labeling workflow:**
   - Draw tight bounding boxes
   - Label ALL visible food items
   - Use consistent class names
   - Quality over speed!

3. **Use smart features:**
   - Auto-annotate (after 50+ labeled)
   - Copy boxes between similar images
   - Keyboard shortcuts (B = box, Enter = save)

#### **Daily Labeling Target:**
- **300 images/day** (takes ~15-20 minutes per 50)
- By Day 11: All 4,500 images labeled

---

### **Day 15: Export Dataset**

1. **Configure preprocessing:**
   - Resize: 640×640
   - Auto-orient: Yes
   - Keep originals

2. **Setup augmentation:**
   - Flip horizontal
   - Rotate ±15°
   - Brightness ±15%
   - Generate 2× augmented

3. **Export:**
   - Format: **YOLOv8**
   - Split: 70/20/10 (train/val/test)
   - Download & extract to: `dataset/roboflow-export/`

---

## 🩸 Glucose Data Collection (Parallel)

### **What You Need:**
- Glucometer (calibrated)
- Excel or Google Sheets
- Willing participants (10+ people)

### **Data Collection Process:**

1. **Before meal:**
   - Measure glucose
   - Note time, food items, portion

2. **After meal:**
   - Measure at +1 hour
   - Measure at +2 hours
   - Record activity

3. **Use template:**
   - Open: `dataset/glucose-data/GLUCOSE_DATA_TEMPLATE.csv`
   - Add your records (follow format)

### **Target:**
- Minimum: 100 meal records
- Ideal: 300+ meal records
- From: 10+ different people

### **Validate:**
```powershell
python scripts\validate_glucose_data.py
```

---

## ✅ Quick Commands

### **Check image collection progress:**
```powershell
cd d:\Yukti\glucosage\ai-models
python scripts\dataset_stats.py
```

### **Validate image quality:**
```powershell
python scripts\validate_images.py
```

### **Validate glucose data:**
```powershell
python scripts\validate_glucose_data.py
```

### **Count images in a folder:**
```powershell
Get-ChildItem "dataset\raw-images\roti" | Measure-Object
```

---

## 🎯 Success Criteria

### ✅ Ready for Week 3 (Training) when:

**Images:**
- [ ] 4,000+ images collected
- [ ] All 15 food classes covered
- [ ] Images validated (no errors)
- [ ] Uploaded to Roboflow
- [ ] All images labeled
- [ ] Dataset exported (YOLOv8 format)

**Glucose Data:**
- [ ] 100+ meal records
- [ ] 10+ participants
- [ ] All required fields filled
- [ ] Data validated

---

## 🆘 Common Issues

### "I can't find enough images!"
**Solutions:**
- Use Google Images (Creative Commons)
- Visit local restaurants (ask permission)
- Cook at home and photograph
- Ask friends/family to contribute
- Food delivery app photos

### "Labeling is too slow!"
**Solutions:**
- Use auto-annotate (after 50 images)
- Label similar images together
- Learn keyboard shortcuts
- Take breaks (accuracy matters!)

### "I don't have 10 people for glucose data!"
**Solutions:**
- Start with 5 people (yourself included)
- Each person does 20+ meals
- Use public datasets (Nightscout, OpenAPS)
- Focus on image collection first

---

## 📊 Daily Checklist

```
□ Morning: Collect 150 images
□ Afternoon: Collect 150 images  
□ Evening: Collect 150 images
□ Upload to Roboflow (if 200+ ready)
□ Label 300 images (if uploaded yesterday)
□ Record 1-2 glucose meals (if participating)
□ Run dataset_stats.py to check progress
□ Take breaks! Don't burn out
```

---

## 🚀 After Week 2

Once you complete data collection:

1. **Validate everything:**
   ```powershell
   python scripts\validate_images.py
   python scripts\validate_glucose_data.py
   ```

2. **Confirm checklist:**
   - All validation passes
   - Dataset exported from Roboflow
   - Glucose data file ready

3. **Start training:**
   - Follow: `TRAINING_GUIDE.md`
   - Train YOLOv8 model
   - Train glucose prediction model

---

## 💡 Pro Tips

1. **Batch your work:**
   - Collect images in bulk
   - Upload in batches
   - Label in focused sessions

2. **Quality matters:**
   - 4,000 good images > 5,000 bad images
   - Accurate labels > Fast labels
   - Clean data > Messy data

3. **Stay organized:**
   - Use consistent naming
   - Track progress daily
   - Document issues

4. **Get help:**
   - Ask friends to contribute
   - Crowdsource if needed
   - Start with what you have

---

## 📞 Resources

- **Roboflow Docs:** [docs.roboflow.com](https://docs.roboflow.com)
- **Dataset Guide:** `DATASET_GUIDE.md`
- **Training Guide:** `TRAINING_GUIDE.md`
- **Checklist:** `DATA_COLLECTION_CHECKLIST.md`

---

## 🎉 You Got This!

Data collection is the hardest part, but it's also the most important. Quality data = Quality AI.

Stay consistent, take breaks, and remember: you're building something amazing! 🚀

---

**Next:** Once data is ready → `TRAINING_GUIDE.md`
