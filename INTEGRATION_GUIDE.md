# 🔗 Frontend-Backend Integration Guide

## Complete Setup for GlucoSage Full-Stack Application

---

## 📁 File Structure

```
glucosage/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js       # ✅ CREATED - API integration layer
│   │   ├── pages/
│   │   ├── components/
│   │   └── features/
│   ├── .env                  # ✅ CREATED - Frontend env vars
│   └── package.json
│
└── backend/                  # Node.js + Express backend
    ├── src/
    │   ├── controllers/      # ✅ CREATED - All controllers
    │   ├── models/           # ✅ CREATED - MongoDB models
    │   ├── routes/           # ✅ CREATED - API routes
    │   ├── services/         # ✅ CREATED - Business logic
    │   ├── middleware/       # ✅ CREATED - Auth, validation
    │   └── server.js         # ✅ CREATED - Express server
    ├── .env                  # ⚠️ NEEDS SETUP
    ├── package.json          # ✅ CREATED
    └── README.md             # ✅ CREATED
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

**Installs:**
- express, cors, dotenv, mongoose
- bcrypt, jsonwebtoken, multer, axios
- helmet, body-parser, joi, morgan
- nodemon (dev dependency)

### Step 2: Setup Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/glucosage
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

✅ **Frontend:** http://localhost:3000  
✅ **Backend:** http://localhost:5000

---

## 🔧 MongoDB Setup

### Option A: Local MongoDB

**Install MongoDB:**
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Install and add to PATH
```

**Start MongoDB:**
```powershell
mongod --dbpath ./data/db
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glucosage
   ```

---

## 🎯 Replace Mock Services with Real API

### 1. Update Authentication (Onboarding & Splash)

**Before (Mock):**
```typescript
// frontend/src/pages/Onboarding/index.tsx
const handleContinue = () => {
  navigate('/home');
};
```

**After (Real API):**
```typescript
import { authAPI } from '../../services/api';

const handleRegister = async () => {
  try {
    const response = await authAPI.register({
      name: userName,
      email: userEmail,
      password: userPassword,
      age: userAge,
      userType: 'patient',
      language: selectedLanguage,
      diagnosisType: 'Type 2 Diabetes'
    });
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/home');
  } catch (error) {
    console.error('Registration failed:', error.response?.data);
    alert('Registration failed. Please try again.');
  }
};
```

### 2. Update Food Scanning

**Before (Mock):**
```typescript
// frontend/src/hooks/useFoodScan.ts
import { analyzeFoodImage } from '../features/foodScan/mockFoodAI';

const analysisResult = await analyzeFoodImage(imageData);
```

**After (Real API):**
```typescript
import { foodAPI } from '../services/api';

const scanFood = async (imageFile) => {
  try {
    const response = await foodAPI.scanFood(imageFile, 'lunch', 'My meal');
    const analysisResult = response.data.data;
    setResult(analysisResult);
    return analysisResult;
  } catch (error) {
    setError('Failed to analyze food');
    return null;
  }
};
```

### 3. Update Glucose Prediction

**Before (Mock):**
```typescript
// frontend/src/hooks/usePrediction.ts
import { getCurrentPrediction } from '../features/prediction/mockPredictor';

const data = await getCurrentPrediction();
```

**After (Real API):**
```typescript
import { glucoseAPI } from '../services/api';

const loadPrediction = async () => {
  try {
    const response = await glucoseAPI.getPrediction();
    const data = response.data.data;
    setPredictionData(data);
  } catch (error) {
    setError('Failed to load prediction');
  }
};
```

### 4. Update ABHA Records

**Before (Mock):**
```typescript
// frontend/src/context/ABHAContext.tsx
import { getHealthRecords } from '../features/abha/mockABHAServices';

const records = await getHealthRecords();
```

**After (Real API):**
```typescript
import { abhaAPI } from '../services/api';

const loadABHAData = async () => {
  try {
    const profileRes = await abhaAPI.getProfile();
    const recordsRes = await abhaAPI.getRecords();
    
    setAbhaProfile(profileRes.data.data);
    setHealthRecords(recordsRes.data.data);
  } catch (error) {
    console.error('Failed to load ABHA data:', error);
  }
};
```

### 5. Update Doctor Dashboard

**Before (Mock):**
```typescript
// frontend/src/pages/DoctorView/index.tsx
import { getAllPatients } from '../../features/doctorView/doctorService';

const data = await getAllPatients();
```

**After (Real API):**
```typescript
import { doctorAPI } from '../../services/api';

const loadPatients = async () => {
  try {
    const response = await doctorAPI.getAllPatients();
    setPatients(response.data.data);
  } catch (error) {
    console.error('Failed to load patients:', error);
  }
};
```

---

## 🔐 Authentication Flow

### 1. Login Process

```typescript
// frontend/src/pages/Splash/index.tsx
import { authAPI } from '../../services/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, user } = response.data;
    
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update context
    setUser(user);
    
    // Navigate
    navigate('/home');
  } catch (error) {
    alert('Invalid credentials');
  }
};
```

### 2. Protected Route Check

```typescript
// frontend/src/router/AppRouter.tsx
import { useEffect } from 'react';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await authAPI.getMe();
      } catch (error) {
        navigate('/');
      }
    };
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      verifyAuth();
    }
  }, []);
  
  return children;
};
```

### 3. Logout

```typescript
const handleLogout = async () => {
  try {
    await authAPI.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  } catch (error) {
    console.error('Logout failed');
  }
};
```

---

## 📸 File Upload Example (Food Scanning)

```typescript
// frontend/src/pages/FoodScan/index.tsx
import { foodAPI } from '../../services/api';

const handleCapture = async () => {
  // Capture from video
  const canvas = canvasRef.current;
  const video = videoRef.current;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  // Convert to blob
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'food.jpg', { type: 'image/jpeg' });
    
    try {
      setIsScanning(true);
      const response = await foodAPI.scanFood(file, 'lunch');
      const result = response.data.data;
      
      navigate('/scan/result', { state: { result } });
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Failed to analyze food');
    } finally {
      setIsScanning(false);
    }
  }, 'image/jpeg');
};
```

---

## 🎤 Voice Integration with Backend

```typescript
// frontend/src/components/MicButton/index.tsx
import { voiceAPI } from '../../services/api';
import { startListening } from '../../features/voice/voiceHooks';

const handleClick = async () => {
  try {
    setIsListening(true);
    
    // Get voice transcript
    const lang = user?.language === 'hi' ? 'hi-IN' : 'en-US';
    const transcript = await startListening(lang);
    
    // Send to backend for processing
    const response = await voiceAPI.processCommand(transcript, lang, 'query');
    const { action, route, message } = response.data.data;
    
    // Execute action
    if (action === 'navigate' && route) {
      navigate(route);
    }
    
    onListen?.(transcript);
  } catch (error) {
    console.error('Voice failed:', error);
  } finally {
    setIsListening(false);
  }
};
```

---

## 📊 Real-Time Data Sync

### Glucose Reading with Auto-Update

```typescript
const addGlucoseReading = async (reading) => {
  try {
    // Add to backend
    const response = await glucoseAPI.addReading(reading);
    
    // Refresh prediction
    const predictionRes = await glucoseAPI.getPrediction();
    setPredictionData(predictionRes.data.data);
    
    // Refresh statistics
    const statsRes = await glucoseAPI.getStatistics('7d');
    setStatistics(statsRes.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to add reading', error);
  }
};
```

---

## 🔄 Migration Checklist

### Phase 1: Setup ✅
- [x] Created API service layer
- [x] Added environment variables
- [x] Setup axios interceptors
- [x] Configured CORS

### Phase 2: Replace Mocks (To Do)
- [ ] Replace mockFoodAI with real API
- [ ] Replace mockPredictor with real API
- [ ] Replace mockABHAServices with real API
- [ ] Replace doctorService with real API

### Phase 3: Testing
- [ ] Test authentication flow
- [ ] Test food scanning
- [ ] Test glucose tracking
- [ ] Test ABHA integration
- [ ] Test doctor dashboard

### Phase 4: Production
- [ ] Deploy backend (Heroku/Railway)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Update API URLs
- [ ] Test end-to-end

---

## 🧪 Testing API Calls

### Test Registration

```typescript
// In browser console on frontend
import { authAPI } from './src/services/api';

authAPI.register({
  name: "Test User",
  email: "test@example.com",
  password: "test123",
  age: 30,
  userType: "patient",
  language: "en"
}).then(res => console.log(res.data));
```

### Test Food Scan

```typescript
// Create test image
const response = await fetch('/test-food.jpg');
const blob = await response.blob();
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

foodAPI.scanFood(file, 'lunch')
  .then(res => console.log('Food analysis:', res.data));
```

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:3000',  // Your frontend URL
  credentials: true
}));
```

### Issue 2: 401 Unauthorized

**Error:** `401 Unauthorized on protected routes`

**Solution:**
```typescript
// Check if token is set
const token = localStorage.getItem('token');
console.log('Token:', token);

// Re-login if needed
await authAPI.login(email, password);
```

### Issue 3: MongoDB Connection Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
```env
# backend/.env
# Check connection string format
MONGODB_URI=mongodb://localhost:27017/glucosage
# OR for Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glucosage?retryWrites=true&w=majority
```

---

## 📞 API Response Format

All backend responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

---

## 🎉 You're All Set!

Your full-stack GlucoSage app is ready!

**Next Steps:**
1. ✅ Start MongoDB
2. ✅ Run backend: `npm run dev`
3. ✅ Run frontend: `npm run dev`
4. ✅ Test login/registration
5. ✅ Replace mock services one by one
6. ✅ Deploy to production

---

**Need Help?**
- Backend API docs: `backend/README.md`
- API endpoints: http://localhost:5000/health
- Test with Postman or cURL

**Happy Coding! 🚀**
