# ========================================
# LOGMEAL API SETUP GUIDE
# ========================================

## What is LogMeal?
LogMeal is a FREE food recognition API that can detect 1300+ dishes including Indian food.
- FREE tier: 500 API calls/month
- No training needed
- Better accuracy for Indian dishes
- Includes nutrition data

## Quick Setup (2 minutes)

### Step 1: Get FREE API Token
1. Go to: https://logmeal.es/developers/
2. Click "Sign Up" (top right)
3. Fill in your details (free account)
4. Verify your email
5. Go to Dashboard → API Keys
6. Copy your API token

### Step 2: Add Token to .env File
1. Open `backend\.env` file
2. Add this line:
   ```
   LOGMEAL_API_TOKEN=your_token_here
   ```
3. Replace `your_token_here` with your actual token

### Step 3: Restart AI Server
```bash
cd ai-models
python api_server.py
```

You should see: ✅ LogMeal API initialized (FREE tier: 500 requests/month)

## API Endpoints

### Use LogMeal Detection
**POST** `/api/v1/food/detect/logmeal`

**Request:**
```json
{
  "image": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "item": "idli",
      "confidence": 0.95,
      "food_type": "South Indian",
      "nutrition": {
        "calories": 100,
        "carbs": 20,
        "protein": 4,
        "fat": 0.5
      }
    }
  ],
  "source": "logmeal_api"
}
```

## Testing

### Test via Python:
```python
from food_recognition.logmeal_api import LogMealDetector

detector = LogMealDetector("YOUR_API_TOKEN")
results = detector.detect_food("path/to/image.jpg")
print(results)
```

### Test via cURL:
```bash
curl -X POST http://localhost:5001/api/v1/food/detect/logmeal \
  -H "Content-Type: application/json" \
  -d '{"image": "BASE64_IMAGE_HERE"}'
```

## Benefits Over Custom Training

✅ **No Training Required** - Works immediately
✅ **Better Accuracy** - Trained on millions of images
✅ **Broader Coverage** - 1300+ dishes vs 17 trained
✅ **Nutrition Included** - Automatic calorie/carb data
✅ **Always Updated** - LogMeal improves their model
✅ **FREE Tier** - 500 requests/month at no cost

## Usage Limits

- **FREE Tier:** 500 requests/month
- **Paid Plans:** Available if you need more
- **Rate Limit:** ~10 requests/minute

## Support

- Documentation: https://logmeal.es/api-docs/
- Support: support@logmeal.es
- Status: https://status.logmeal.es/

========================================
