import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import PredictionChart from '../../components/Chart';
import Loader from '../../components/Loader';
import { usePrediction } from '../../hooks/usePrediction';
import { whatIfScenarios } from '../../features/prediction/mockPredictor';

const Prediction = () => {
  const { predictionData, isLoading, runWhatIfScenario } = usePrediction();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const handleScenario = async (scenarioType: string) => {
    setActiveScenario(scenarioType);
    await runWhatIfScenario(scenarioType);
  };

  const resetToDefault = () => {
    setActiveScenario(null);
    runWhatIfScenario('default');
  };

  if (isLoading || !predictionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="large" text="Loading predictions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="Glucose Prediction" 
        subtitle="Today's trend and forecast"
      />

      <div className="p-6 space-y-6">
        {/* Current Reading */}
        <div className="card">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Reading</p>
            <p className="text-5xl font-bold text-primary-700">{predictionData.current}</p>
            <p className="text-lg text-gray-600 mt-1">mg/dL</p>
          </div>
        </div>

        {/* Prediction Alert */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-orange-900 text-lg">Peak Forecast</h4>
              <p className="text-orange-800 mt-1">{predictionData.prediction.message}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <PredictionChart 
          data={predictionData.trend}
          peakValue={predictionData.prediction.peakValue}
          peakTime={predictionData.prediction.peakTime}
        />

        {/* What-If Scenarios */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">🔮 What-If Scenarios</h3>
          <p className="text-sm text-gray-600 mb-4">See how different actions affect your glucose</p>
          
          <div className="space-y-3">
            {whatIfScenarios.map((scenario) => (
              <button
                key={scenario.type}
                onClick={() => handleScenario(scenario.type)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  activeScenario === scenario.type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{scenario.label}</span>
                  {activeScenario === scenario.type && (
                    <span className="text-primary-600 font-semibold">✓ Active</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {activeScenario && (
            <button
              onClick={resetToDefault}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Reset to Default Prediction
            </button>
          )}
        </div>

        {/* Zones Legend */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Glucose Zones</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Normal (70-140 mg/dL)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Moderate (140-180 mg/dL)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">High (180+ mg/dL)</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Prediction;
