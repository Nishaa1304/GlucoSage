# Indian Food Recognition Dataset Guide

## 🎯 Dataset Requirements

### Target Classes (15 Food Items)
1. **roti** - whole wheat flatbread
2. **chapati** - similar to roti, thinner
3. **poha** - flattened rice dish
4. **upma** - semolina breakfast dish
5. **idli** - steamed rice cake
6. **dosa** - crispy rice crepe
7. **dal** - lentil soup/curry
8. **rice** - plain white/brown rice
9. **pulao** - flavored rice dish
10. **biryani** - spiced rice with meat/vegetables
11. **sabzi** - vegetable curry (generic)
12. **curry** - gravy-based dish
13. **paratha** - layered flatbread
14. **fruits** - assorted fruits
15. **vegetables** - raw/cooked vegetables

### Minimum Images Per Class
- **Core items** (roti, rice, dal, sabzi): **300-400 images each**
- **Regional items** (dosa, idli, poha, upma): **250-300 images each**
- **Complex items** (biryani, pulao): **300-350 images each**
- **Generic categories** (fruits, vegetables): **400-500 images each**

**Total minimum dataset size: ~5,000 images**

---

## 📸 Data Collection Strategy

### 1. Real-World Scenarios
- **Thali plates** (multiple items together)
- **Single servings** (individual bowls/plates)
- **Restaurant settings**
- **Home-cooked meals**
- **Street food stalls**
- **Buffet arrangements**

### 2. Plate Types
- Stainless steel plates (most common)
- Ceramic plates (white, colored)
- Banana leaves (South Indian meals)
- Disposable plates
- Bowls and katoris
- Mixed serving styles

### 3. Lighting Conditions
- Natural daylight (morning, afternoon, evening)
- Indoor tube lights
- Warm incandescent bulbs
- Restaurant ambience lighting
- Phone flashlight
- Low-light conditions

### 4. Camera Angles
- **Top-down (0-30°)**: Primary angle - 60% of images
- **Oblique (30-60°)**: Side angles - 30% of images
- **Eye-level (60-90°)**: Rare but include - 10% of images

---

## 🏷️ Labeling Guidelines

### Tools Recommended
- **Roboflow** (easiest, cloud-based)
- **LabelImg** (offline option)
- **CVAT** (for teams)

### Bounding Box Rules

#### 1. Single Item Detection
```
✅ DO: Draw tight box around the food item
❌ DON'T: Include plate edges or excessive background
```

#### 2. Overlapping Foods (Thali)
```
Example: Thali with rice, dal poured over rice, and sabzi on the side

- Label rice even if partially covered by dal
- Draw dal box over the visible dal area
- Separate sabzi with its own box
- If items are 80%+ overlapped, label the top item only
```

#### 3. Distinguishing Similar Items

**Roti vs Chapati vs Paratha:**
- **Roti**: Thicker, spots visible, medium-sized
- **Chapati**: Thinner, lighter, larger diameter
- **Paratha**: Layered, often square/triangular, oily surface

**Dal vs Curry vs Sabzi:**
- **Dal**: Lentils visible, liquidy, yellow/orange/brown
- **Curry**: Thick gravy, may contain meat/paneer
- **Sabzi**: Solid vegetables, less gravy, chunky

**Rice vs Pulao vs Biryani:**
- **Rice**: Plain white/brown, no spices visible
- **Pulao**: Light-colored, vegetables mixed in, fragrant
- **Biryani**: Dark-colored, spices/meat visible, layered

#### 4. Multiple Instances
```
Example: 2 rotis and 1 bowl of dal

- Draw separate boxes for each roti
- Label each as "roti"
- Single box for dal bowl
```

#### 5. Partial Visibility
- If **>50% visible**: Label it
- If **<50% visible**: Skip or mark as "occluded"

---

## 🔄 Data Augmentation Strategy

### Essential Augmentations (Apply During Training)

#### 1. Brightness Adjustment
```yaml
brightness: ±20%
```
**Why**: Handles different lighting conditions in homes/restaurants

#### 2. Rotation
```yaml
rotation: ±15°
```
**Why**: Phone cameras are rarely perfectly level

#### 3. Zoom/Scale
```yaml
zoom: 80% to 120%
```
**Why**: Different distances from plate

#### 4. Horizontal Flip
```yaml
flip: 50% probability
```
**Why**: Food arrangement varies

#### 5. Blur
```yaml
blur: 0px to 2px
```
**Why**: Motion blur, camera shake

#### 6. Noise
```yaml
noise: ±3% Gaussian
```
**Why**: Low-light camera noise

#### 7. Saturation/Hue
```yaml
saturation: ±15%
hue: ±5°
```
**Why**: Different food freshness, lighting color temperature

### ❌ Avoid These Augmentations
- **Vertical flip**: Food doesn't appear upside down
- **Heavy rotation (>20°)**: Unrealistic
- **Cutout/mosaic on Indian thali**: Breaks context

---

## 🎨 Roboflow Dataset Configuration

### Step 1: Create Project
```
1. Sign up at roboflow.com
2. Create new project: "Indian Food Detection"
3. Type: Object Detection
4. Annotation format: YOLO v8
```

### Step 2: Upload Images
```
1. Organize images in folders by class (optional)
2. Upload in batches of 500
3. Let Roboflow auto-detect duplicates
4. Remove blurry/bad images
```

### Step 3: Labeling
```
1. Use Smart Polygon tool for irregular shapes
2. Assign correct class from dropdown
3. For thalis, label all visible items
4. Add notes for ambiguous cases
```

### Step 4: Train/Test Split
```yaml
Train: 70%
Validation: 20%
Test: 10%
```

### Step 5: Generate Dataset
```yaml
Format: YOLOv8
Preprocessing:
  - Auto-Orient: Yes
  - Resize: 640x640 (stretch)
  
Augmentations:
  - Rotation: -15° to +15°
  - Brightness: -20% to +20%
  - Blur: Up to 2px
  - Noise: Up to 3%
  
Output: 3x augmented images
```

---

## 🍛 Handling Complex Scenarios

### 1. Mixed Thali with 6+ Items
**Problem**: Too many overlapping foods

**Solution**:
- Prioritize high-carb items (rice, roti, paratha)
- Label visible dal/curry even if small portion
- Group similar vegetables as "sabzi"
- Skip garnishes (coriander, onions)

### 2. Poori vs Roti Confusion
**Problem**: Both are round flatbreads

**Solution**:
- **Poori**: Puffed, golden, shiny, usually smaller
- **Roti**: Flat, spots (charring), matte surface
- Collect 50 side-by-side comparison images

### 3. Dal Poured Over Rice
**Problem**: Two items merged

**Solution**:
- Label rice where visible
- Label dal as separate box over the mixed area
- Model will learn to detect both

### 4. Banana Leaf Thalis
**Problem**: No plate boundary, foods touch leaf

**Solution**:
- Label each food item separately
- Include leaf texture in training
- Collect 200+ banana leaf images

### 5. Low-Light Images
**Problem**: Colors look similar, hard to distinguish

**Solution**:
- Use brightness augmentation
- Collect images with phone flashlight
- Add contrast enhancement in preprocessing

---

## 📊 Dataset Quality Checklist

Before training, ensure:

- [ ] Each class has **minimum 200 images**
- [ ] At least **30% images have multiple foods**
- [ ] **20% images are thali-style** (5+ items)
- [ ] **15% images are low-light**
- [ ] **10% images are on banana leaf/steel plate**
- [ ] All bounding boxes are **tight** (no excessive padding)
- [ ] Ambiguous images are **reviewed by 2 people**
- [ ] Train/val/test split has **no data leakage**
- [ ] Augmentation **doesn't over-distort** food appearance

---

## 🚀 Next Steps

After dataset preparation:
1. Export dataset from Roboflow in YOLOv8 format
2. Download the `.zip` file with `data.yaml`
3. Proceed to training (see `TRAINING_GUIDE.md`)

---

## 📌 Pro Tips

### Tip 1: Start Small
Train on 5 classes first (roti, rice, dal, sabzi, curry) → validate → expand

### Tip 2: Use Roboflow's Smart Suggestions
It can auto-label similar images after you label 50-100 manually

### Tip 3: Version Control
Use Roboflow versions to track dataset improvements

### Tip 4: Collaborate
Share project with team for faster labeling

### Tip 5: Monitor Class Balance
Avoid having 500 roti images and only 100 dosa images

---

**Dataset preparation is 70% of model success. Invest time here!**
