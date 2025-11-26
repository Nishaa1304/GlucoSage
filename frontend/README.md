# GlucoSage Frontend

## 🌟 Voice-First Diabetes Companion

A modern, accessible, and voice-first web application for diabetes management built with React, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

### 1. **Voice-First Dashboard**
- Large, accessible microphone button
- Voice command recognition
- Multilingual support (English & Hindi)
- Natural language processing for health queries

### 2. **Food Image Analysis**
- Camera-based food scanning
- AI-powered nutrition breakdown
- Glycemic load assessment
- Sugar impact predictions
- Personalized dietary advice

### 3. **Non-Invasive Glucose Prediction**
- Real-time glucose trend visualization
- Peak value forecasting
- What-if scenario analysis
- Time-based predictions
- Color-coded risk zones

### 4. **ABHA-Integrated Health Records**
- Digital health vault
- Voice-based record queries
- Complete medical history
- Lab results & prescriptions
- Easy sharing with healthcare providers

### 5. **Doctor Dashboard**
- Patient monitoring interface
- Risk assessment & alerts
- Analytics overview
- Patient summary cards
- Quick action buttons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## 📁 Project Structure

\`\`\`
frontend/
├── public/              # Static assets
│   ├── manifest.json   # PWA manifest
│   └── icons/          # App icons
│
├── src/
│   ├── pages/          # Page components
│   │   ├── Splash/
│   │   ├── Onboarding/
│   │   ├── Home/
│   │   ├── FoodScan/
│   │   ├── Prediction/
│   │   ├── ABHA/
│   │   └── DoctorView/
│   │
│   ├── components/     # Reusable components
│   │   ├── MicButton/
│   │   ├── Chart/
│   │   ├── FoodCard/
│   │   ├── AlertCard/
│   │   ├── ABHARecordCard/
│   │   ├── PatientCard/
│   │   ├── BottomNav/
│   │   ├── Loader/
│   │   └── PageHeader/
│   │
│   ├── features/       # Feature-specific logic
│   │   ├── voice/
│   │   ├── foodScan/
│   │   ├── prediction/
│   │   ├── abha/
│   │   └── doctorView/
│   │
│   ├── hooks/          # Custom React hooks
│   │   ├── useVoice.ts
│   │   ├── useFoodScan.ts
│   │   └── usePrediction.ts
│   │
│   ├── context/        # React Context providers
│   │   ├── UserContext.tsx
│   │   ├── ABHAContext.tsx
│   │   └── PredictionContext.tsx
│   │
│   ├── utils/          # Utility functions
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── styles/         # Global styles
│   │   └── globals.css
│   │
│   ├── router/         # Routing configuration
│   │   └── AppRouter.tsx
│   │
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
\`\`\`

## 🎨 Design Principles

- **Elderly-Friendly**: Large text, high contrast, simple navigation
- **Voice-First**: Prioritizes voice interaction over typing
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessible**: WCAG 2.1 compliant, screen reader friendly
- **Clean UI**: Minimalist design with clear visual hierarchy

## 🔧 Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **State Management**: React Context API

## 🎯 Key Components

### MicButton
Large, accessible voice input button with visual feedback

### PredictionChart
Interactive glucose trend visualization with zone indicators

### FoodCard
Displays detected food items with nutrition information

### ABHARecordCard
Shows health records with type-specific styling

### PatientCard (Doctor View)
Comprehensive patient summary with risk assessment

## 🌐 Mock Services

All AI and ABHA services are currently mocked for demo purposes:

- `mockFoodAI.ts` - Simulates food recognition
- `mockPredictor.ts` - Generates glucose predictions
- `mockABHAServices.ts` - Provides sample health records
- `doctorService.ts` - Supplies patient data

## 📱 PWA Support

The app is configured as a Progressive Web App:
- Installable on mobile devices
- Offline capability (future)
- App-like experience

## 🚀 Deployment

\`\`\`bash
# Build for production
npm run build

# The dist/ folder can be deployed to any static hosting service:
# - Vercel
# - Netlify
# - Firebase Hosting
# - GitHub Pages
\`\`\`

## 🤝 Contributing

This is a hackathon/competition project. For production use, replace all mock services with real implementations.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

**GlucoSage Team**

---

Built with ❤️ for better diabetes management
