import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from '../pages/Splash';
import Onboarding from '../pages/Onboarding';
import Home from '../pages/Home';
import FoodScan from '../pages/FoodScan';
import FoodScanResult from '../pages/FoodScan/Result';
import Prediction from '../pages/Prediction';
import ABHA from '../pages/ABHA';
import DoctorView from '../pages/DoctorView';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/scan" element={<FoodScan />} />
        <Route path="/scan/result" element={<FoodScanResult />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/abha" element={<ABHA />} />
        <Route path="/doctor" element={<DoctorView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
