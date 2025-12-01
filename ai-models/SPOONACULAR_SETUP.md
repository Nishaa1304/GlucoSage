# 🍽️ Spoonacular API Setup Guide

## Why Spoonacular? ⭐ RECOMMENDED

**🏆 BEST SOLUTION** - Most reliable and feature-rich:

✅ **150 FREE requests/day** (4,500/month!)  
✅ **Excellent food recognition** - AI-powered image analysis  
✅ **Complete nutrition data** - calories, macros, vitamins  
✅ **Indian food coverage** - curry, biryani, dal, dosa, etc.  
✅ **Recipe matching** - suggests similar recipes  
✅ **Direct API** - no middleman, faster response  
✅ **Well-documented** - extensive API documentation  

---

## 🚀 Quick Setup (3 minutes)

### Step 1: Get Your FREE API Key

**Option A: Direct from Spoonacular (RECOMMENDED)**

1. **Go to**: https://spoonacular.com/food-api/console#Dashboard

2. **Sign Up**:
   - Click "Get Started" or "Sign Up"
   - Use email or Google account
   - **FREE tier** - no credit card required

3. **Get API Key**:
   - After signup, you'll see your dashboard
   - Your API key will be displayed prominently
   - Copy the key (looks like: `abc123def456...`)

4. **Free Tier Limits**:
   - **150 requests/day** (4,500/month)
   - Perfect for development & testing

**Option B: Via RapidAPI (Alternative)**

1. Go to: https://rapidapi.com/spoonacular/api/spoonacular-recipe-food-nutrition-v1
2. Subscribe to FREE plan
3. Copy RapidAPI key (longer key, works differently)

### Step 2: Configure GlucoSage

1. **Open `.env` file** in `ai-models` folder:
   ```bash
   cd D:\Yukti\glucosage\ai-models
   notepad .env
   ```

2. **Add your API key**:
   ```env
   SPOONACULAR_API_KEY=your_api_key_here
   ```
   
   Replace `your_api_key_here` with the key you copied.

3. **Save and close** the file.

### Step 3: Test the Integration

1. **Start the API server**:
   ```bash
   cd D:\Yukti\glucosage\ai-models
   python api_server.py
   ```

2. **Look for confirmation**:
   ```
   ✅ Spoonacular API initialized (FREE: 150 requests/day) 🌟
   🎯 Best choice for food recognition & nutrition
   ```

3. **Test with sample image**:
   ```bash
   python food-recognition/test_spoonacular.py
   ```

---

## 📡 API Endpoints

### Endpoint: `/api/v1/food/detect/spoonacular`

**Method**: `POST`

**Request** (multipart/form-data):
```bash
curl -X POST http://localhost:5001/api/v1/food/detect/spoonacular \
  -F "file=@path/to/your/food-image.jpg"
```

**Request** (JSON with base64):
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response**:
```json
{
  "success": true,
  "detections": [
    {
      "item": "chicken_biryani",
      "confidence": 0.95,
      "nutrition": {
        "calories": 450,
        "carbohydrates": 65,
        "protein": 18,
        "fat": 15,
        "fiber": 3,
        "sugar": 4,
        "sodium": 850
      },
      "portion_size": "large",
      "estimated_weight": 350,
      "detection_method": "spoonacular_api",
      "similar_recipes": [
        {
          "title": "Hyderabadi Biryani",
          "id": 654321
        },
        {
          "title": "Chicken Biryani with Raita",
          "id": 654322
        }
      ]
    }
  ],
  "total_items": 1,
  "source": "spoonacular_api"
}
```

---

## 🧪 Testing Commands

### Test 1: Basic Connection Test
```bash
cd D:\Yukti\glucosage\ai-models
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('API Key:', os.getenv('SPOONACULAR_API_KEY')[:20] + '...' if os.getenv('SPOONACULAR_API_KEY') else 'NOT FOUND')"
```

### Test 2: Full Detection Test
```bash
cd D:\Yukti\glucosage\ai-models
python food-recognition/test_spoonacular.py
```

### Test 3: Direct API Test (cURL)
```bash
# Replace YOUR_API_KEY with your actual key
curl -X POST "https://api.spoonacular.com/food/images/analyze?apiKey=YOUR_API_KEY" \
  -F "file=@dataset/raw-images/biryani/biryani_1.jpg"
```

---

## 🍛 Foods Recognized

### Indian Cuisine:

**North Indian**:
- Biryani, Pulao, Naan, Roti, Paratha, Kulcha
- Dal Makhani, Rajma, Chole, Chana Masala
- Paneer Butter Masala, Palak Paneer, Kadai Paneer
- Butter Chicken, Tandoori Chicken, Chicken Tikka
- Aloo Gobi, Baingan Bharta, Mix Veg

**South Indian**:
- Idli, Dosa, Vada, Uttapam
- Sambar, Rasam, Pongal
- Upma, Rava Idli, Medu Vada
- Kesari Bath, Payasam

**Street Food**:
- Samosa, Pakora, Bhel Puri, Pani Puri
- Vada Pav, Pav Bhaji, Dabeli

**Sweets**:
- Gulab Jamun, Jalebi, Rasgulla, Kheer
- Laddu, Barfi, Halwa

**Plus 1000+ international dishes!**

---

## 💰 Pricing & Limits

### FREE Plan (Recommended for You)
- **Cost**: $0/month
- **Requests**: 150/day (4,500/month)
- **Rate Limit**: No specific limit
- **Perfect for**: Your GlucoSage app during development

### Paid Plans (If You Need More)
- **Mega**: $29/month - 1,500/day
- **Ultra**: $89/month - 5,000/day
- **Custom**: For large-scale production

**Your app should work perfectly with FREE tier!**

---

## 🔧 Troubleshooting

### Error: "API not configured"
**Solution**: Check `.env` file has `SPOONACULAR_API_KEY=your_key`

### Error: "Invalid API key" or 401 Unauthorized
**Solution**: 
1. Verify you copied the full key from Spoonacular dashboard
2. Make sure there are no spaces before/after the key in `.env`
3. Try regenerating the key from Spoonacular dashboard

### Error: "Rate limit exceeded" or 402
**Solution**: 
- Free plan: 150 requests/day
- Check usage at: https://spoonacular.com/food-api/console#Dashboard
- Resets daily at midnight UTC
- Upgrade plan if needed for production

### Error: "Module not found"
**Solution**: Install dependencies:
```bash
pip install requests python-dotenv pillow
```

### Detection returns generic results
**Tip**: 
- Image quality matters - use clear, well-lit photos
- Single dish photos work better than complex thalis
- For thalis, try cropping individual items

---

## 🎯 Comparison: Why Spoonacular?

| Feature | Your Model (v14) | Spoonacular API |
|---------|-----------------|-----------------|
| Foods Recognized | 17 | **1000+** ✅ |
| Training Time | 15 hours | **0** ✅ |
| Indian Food | Limited | **Excellent** ✅ |
| Accuracy | 80.85% | **90-95%** ✅ |
| Nutrition Data | Manual | **Automatic** ✅ |
| Setup Time | Days | **3 minutes** ✅ |
| Free Requests | ∞ | **4500/month** ✅ |
| Recipe Matching | No | **Yes** ✅ |

---

## 📚 Additional Features

### Recipe Search
```python
from spoonacular_api import SpoonacularDetector
detector = SpoonacularDetector(api_key)

# Search for recipes
recipes = detector.search_recipes("biryani", number=5)
```

### Get Recipe Nutrition
```python
# Get detailed nutrition for a recipe
nutrition = detector.get_recipe_nutrition(recipe_id=654321)
```

---

## 🔗 Useful Links

- **API Dashboard**: https://spoonacular.com/food-api/console#Dashboard
- **Documentation**: https://spoonacular.com/food-api/docs
- **API Explorer**: https://spoonacular.com/food-api/console
- **Support**: support@spoonacular.com
- **Pricing**: https://spoonacular.com/food-api/pricing

---

## 🎉 Next Steps

1. ✅ **Integration Complete** - Spoonacular is now available
2. 🔑 **Get API Key** - 3 minutes at spoonacular.com/food-api
3. ⚙️ **Configure** - Add key to `.env` file
4. 🧪 **Test** - Run test_spoonacular.py
5. 🚀 **Deploy** - Use in your app!

---

## ⚡ Performance Tips

1. **Cache Results**: Store detection results to avoid repeated API calls
2. **Batch Processing**: Process multiple foods in one session
3. **Image Optimization**: Resize images to max 1024x1024 before uploading
4. **Error Handling**: Implement retry logic for network issues
5. **Fallback**: Keep your local model as backup when offline

---

**Questions?** Check the console output when starting `api_server.py` for initialization status.

**Ready to test?** Run: `python food-recognition/test_spoonacular.py`
