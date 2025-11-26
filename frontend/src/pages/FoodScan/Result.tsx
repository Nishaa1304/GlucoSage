import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import FoodCard from '../../components/FoodCard';
import AlertCard from '../../components/AlertCard';
import Loader from '../../components/Loader';
import { useFoodScan } from '../../hooks/useFoodScan';

const FoodScanResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scanFood, result, isScanning } = useFoodScan();
  const [saved, setSaved] = useState(false);
  const imageData = location.state?.imageData;

  useEffect(() => {
    // Trigger food analysis when component mounts
    scanFood(imageData || 'mock-image-data');
  }, [scanFood, imageData]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      navigate('/abha');
    }, 1500);
  };

  if (isScanning || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="large" text="Analyzing your food..." />
      </div>
    );
  }

  const glycemicColor = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="Food Analysis" 
        subtitle="Results ready"
        showBack={true}
      />

      <div className="p-6 space-y-6">
        {/* Image Preview */}
        {imageData ? (
          <div className="bg-gray-200 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
            <img src={imageData} alt="Your food" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="bg-gray-200 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          </div>
        )}

        {/* Detected Items */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Detected Items</h3>
          <div className="flex flex-wrap gap-3">
            {result.detectedItems.map((item, index) => (
              <FoodCard 
                key={index}
                name={item.name}
                quantity={item.quantity}
                unit={item.unit}
              />
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Nutrition Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-blue-700">{result.nutrition.carbs}g</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-purple-700">{result.nutrition.protein}g</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-orange-700">{result.nutrition.fat}g</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-2xl font-bold text-green-700">{result.nutrition.calories}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Glycemic Load:</span>
            <span className={`px-4 py-2 rounded-full font-semibold ${glycemicColor[result.nutrition.glycemicLoad]}`}>
              {result.nutrition.glycemicLoad}
            </span>
          </div>
        </div>

        {/* Sugar Impact */}
        <AlertCard
          type={result.sugarImpact.prediction.includes('spike') ? 'warning' : 'success'}
          title="Sugar Impact"
          message={`${result.sugarImpact.prediction} in ${result.sugarImpact.peakTime}. Expected range: ${result.sugarImpact.expectedRange}`}
          icon="📈"
        />

        {/* Advice */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">💡 Recommendations</h3>
          <ul className="space-y-2">
            {result.advice.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full btn-primary py-4 text-lg"
        >
          {saved ? '✓ Saved to ABHA Timeline' : 'Save to ABHA Timeline'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default FoodScanResult;
