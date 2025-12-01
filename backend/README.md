# GlucoSage Backend API

## 🚀 Complete REST API for Voice-First Diabetes Management

### 📋 Features

- **Authentication & Authorization** - JWT-based auth with bcrypt password hashing
- **Food Scanning API** - Image upload and AI-powered nutrition analysis
- **Glucose Prediction** - Real-time predictions and what-if scenarios
- **ABHA Integration** - Health records management and voice queries
- **Doctor Dashboard** - Patient monitoring and analytics
- **Voice Commands** - Multilingual voice processing (English/Hindi)
- **Security** - Helmet, CORS, rate limiting, input validation

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── foodController.js
│   │   ├── glucoseController.js
│   │   ├── abhaController.js
│   │   ├── doctorController.js
│   │   └── voiceController.js
│   │
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── GlucoseReading.js
│   │   ├── FoodLog.js
│   │   └── ABHARecord.js
│   │
│   ├── routes/           # API endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── glucoseRoutes.js
│   │   ├── abhaRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── voiceRoutes.js
│   │
│   ├── services/         # Business logic
│   │   ├── foodAIService.js
│   │   ├── predictionService.js
│   │   └── abhaService.js
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── validator.js
│   │   ├── upload.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── utils/           # Helper functions
│   │   ├── database.js
│   │   └── helpers.js
│   │
│   └── server.js        # Entry point
│
├── uploads/             # Uploaded images (auto-created)
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md            # This file
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Edit `.env`:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/glucosage
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod --dbpath ./data/db
```

**Option B: MongoDB Atlas**
- Create cluster at https://cloud.mongodb.com
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Run Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: **http://localhost:5000**

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| POST | `/logout` | Logout user | Yes |
| PUT | `/update-password` | Change password | Yes |

**Example: Register**
```json
POST /api/auth/register
{
  "name": "Meera Sharma",
  "email": "meera@example.com",
  "password": "password123",
  "age": 62,
  "userType": "patient",
  "language": "hi",
  "diagnosisType": "Type 2 Diabetes"
}
```

### User Management (`/api/user`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/language` | Update language | Yes |
| DELETE | `/account` | Deactivate account | Yes |

### Food Scanning (`/api/food`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/scan` | Scan food image | Yes |
| GET | `/logs` | Get food logs | Yes |
| GET | `/logs/:id` | Get single log | Yes |
| PUT | `/logs/:id` | Update log | Yes |
| DELETE | `/logs/:id` | Delete log | Yes |
| GET | `/statistics` | Food statistics | Yes |

**Example: Scan Food**
```bash
POST /api/food/scan
Content-Type: multipart/form-data

foodImage: [image file]
mealType: "lunch"
notes: "Homemade thali"
```

### Glucose Monitoring (`/api/glucose`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reading` | Add glucose reading | Yes |
| GET | `/readings` | Get all readings | Yes |
| GET | `/trend` | Get trend data | Yes |
| GET | `/prediction` | Get prediction | Yes |
| POST | `/what-if` | What-if scenario | Yes |
| GET | `/statistics` | Glucose statistics | Yes |
| DELETE | `/reading/:id` | Delete reading | Yes |

**Example: Add Reading**
```json
POST /api/glucose/reading
{
  "value": 145,
  "readingType": "post-meal",
  "mealContext": "lunch",
  "notes": "Felt normal",
  "mood": "good"
}
```

### ABHA Integration (`/api/abha`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/link` | Link ABHA account | Yes |
| GET | `/profile` | Get ABHA profile | Yes |
| GET | `/records` | Get health records | Yes |
| POST | `/query` | Query records (voice) | Yes |
| POST | `/share` | Share with doctor | Yes |
| POST | `/sync` | Sync records | Yes |

### Doctor Dashboard (`/api/doctor`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/patients` | Get all patients | Doctor |
| GET | `/patients/high-risk` | High-risk patients | Doctor |
| GET | `/patients/:id` | Patient detail | Doctor |
| GET | `/patients/:id/analytics` | Patient analytics | Doctor |
| PUT | `/patients/:id/note` | Update note | Doctor |

### Voice Commands (`/api/voice`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/command` | Process voice command | Yes |
| POST | `/speak` | Text-to-speech | Yes |

---

## 🔐 Authentication

All protected routes require JWT token in header:

```bash
Authorization: Bearer <your-jwt-token>
```

**Login to get token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "meera@example.com", "password": "password123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "name": "Meera", "email": "meera@example.com" }
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","age":25,"userType":"patient"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get profile (with token)
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import collection or create requests
2. Set base URL: `http://localhost:5000/api`
3. Add Authorization header with Bearer token
4. Test all endpoints

---

## 📊 Database Models

### User
- name, email, password, age, userType
- language, phoneNumber, diagnosisType
- targetGlucoseRange, medications
- abhaLinked, doctorId

### GlucoseReading
- userId, value, unit, readingType
- mealContext, timestamp, zone
- symptoms, mood, notes

### FoodLog
- userId, mealType, timestamp, imageUrl
- detectedItems[], nutrition{}
- sugarImpact{}, advice[]

### ABHARecord
- userId, abhaNumber, abhaAddress
- healthRecords[], consentStatus
- lastSyncedAt

---

## 🔌 Frontend Integration

### Update Frontend API Base URL

In your frontend, create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example: Login from Frontend

```javascript
import api from './services/api';

const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Save token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Navigate to home
    navigate('/home');
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
};
```

### Example: Scan Food

```javascript
const handleFoodScan = async (imageFile) => {
  const formData = new FormData();
  formData.append('foodImage', imageFile);
  formData.append('mealType', 'lunch');

  try {
    const response = await api.post('/food/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const { data } = response;
    console.log('Food analysis:', data);
    return data;
  } catch (error) {
    console.error('Scan failed:', error);
  }
};
```

---

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: Secure token-based auth
- **Helmet**: HTTP security headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Joi schemas
- **File Upload Limits**: 5MB max size
- **Error Handling**: Global error middleware

---

## 🚀 Deployment

### Heroku

```bash
# Install Heroku CLI
heroku create glucosage-backend

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main
```

### Railway / Render

1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/glucosage` |
| `JWT_SECRET` | JWT signing key | *Required* |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL (CORS) | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Max upload size | `5242880` (5MB) |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 You're All Set!

Your backend is now ready to power the GlucoSage frontend!

**Next Steps:**
1. Start MongoDB: `mongod`
2. Run backend: `npm run dev`
3. Test health: http://localhost:5000/health
4. Connect frontend to API
5. Start building amazing features! 🚀
