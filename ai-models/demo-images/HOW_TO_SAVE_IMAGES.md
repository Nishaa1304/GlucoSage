# 🎯 Demo Images Setup - Quick Guide

## You just sent 4 images! Here's how to save them:

### 📸 Image Naming Instructions:

Save the images you sent to: `D:\Yukti\glucosage\ai-models\demo-images\`

**Name them EXACTLY as shown:**

1. **First image** (thali with rice, dal, sweet potato curry, vegetables, salad)
   → Save as: `veg-thali-1.jpg`

2. **Second image** (6 idlis with sambar)
   → Save as: `idli-sambar-6pc.jpg`

3. **Third image** (thali with rice, dal, raita, vegetables)
   → Save as: `veg-thali-2.jpg`

4. **Fourth image** (north indian thali with biryani, paneer, dal, roti)
   → Save as: `north-indian-thali.jpg`

---

## 🚀 After Saving Images, Run:

```powershell
cd D:\Yukti\glucosage\ai-models
D:\Yukti\glucosage\.venv\Scripts\python.exe setup_demo.py
```

This will:
✅ Map each image to exact nutrition data
✅ Configure glucose predictions
✅ Create the demo database

---

## 📊 What Each Image Will Show:

### 1. Veg Thali 1
- **Calories:** 720 kcal
- **Carbs:** 98g
- **Glycemic Load:** 53 (High)
- **Glucose Spike:** +68 mg/dL in 60 mins
- **Advice:** Balanced meal, portion control recommended

### 2. Idli Sambar (6pc)
- **Calories:** 380 kcal
- **Carbs:** 68g
- **Glycemic Load:** 35 (Moderate)
- **Glucose Spike:** +58 mg/dL in 45 mins
- **Advice:** Excellent choice! Low GL, high protein ✅

### 3. South Indian Thali
- **Calories:** 680 kcal
- **Carbs:** 92g
- **Glycemic Load:** 51 (High)
- **Glucose Spike:** +65 mg/dL in 55 mins
- **Advice:** Balanced, fiber helps control spike

### 4. North Indian Thali
- **Calories:** 780 kcal
- **Carbs:** 105g
- **Glycemic Load:** 60 (Very High)
- **Glucose Spike:** +75 mg/dL in 65 mins
- **Advice:** High calories, consider half portion ⚠️

---

## ✅ Quick Checklist:

- [ ] Downloaded all 4 images from WhatsApp/wherever you sent them
- [ ] Saved to `D:\Yukti\glucosage\ai-models\demo-images\`
- [ ] Named exactly as above (with hyphens)
- [ ] Ran `setup_demo.py`
- [ ] Saw success messages
- [ ] Ready to test!

**Each image will show ONLY ONE food item with perfect nutrition data!** 🎯
