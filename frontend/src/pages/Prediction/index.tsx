import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getTranslations } from '../../i18n/translations';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import PredictionChart from '../../components/Chart';
import Loader from '../../components/Loader';
import { usePrediction } from '../../hooks/usePrediction';
import { whatIfScenarios } from '../../features/prediction/mockPredictor';

const Prediction = () => {
  const { user } = useUser();
  const t = getTranslations(user?.language || 'en');
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
        <Loader size="large" text={t.loading + '...'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <PageHeader 
        title={t.prediction.title}
        subtitle={t.prediction.subtitle}
      />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Current Reading */}
        <div className="card">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t.prediction.currentReading}</p>
            <p className="text-5xl font-bold text-primary-700">{predictionData.current}</p>
            <p className="text-lg text-gray-600 mt-1">mg/dL</p>
          </div>
        </div>

        {/* Prediction Alert */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-orange-900 text-lg">{t.prediction.peakForecast}</h4>
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
          <h3 className="font-semibold text-lg mb-4">{t.prediction.whatIfScenarios}</h3>
          <p className="text-sm text-gray-600 mb-4">{t.prediction.whatIfSubtitle}</p>
          
          <div className="space-y-3">
            {whatIfScenarios.map((scenario) => {
              const scenarioLabel = scenario.type === 'sweet' ? t.prediction.scenarios.sweet :
                                   scenario.type === 'walk' ? t.prediction.scenarios.walk :
                                   scenario.type === 'skip-meal' ? t.prediction.scenarios.skipMeal :
                                   scenario.type === 'medication' ? t.prediction.scenarios.medication :
                                   scenario.label;
              
              return (
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
                    <span className="font-medium text-gray-800">{scenarioLabel}</span>
                    {activeScenario === scenario.type && (
                      <span className="text-primary-600 font-semibold">✓ {user?.language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {activeScenario && (
            <button
              onClick={resetToDefault}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {t.prediction.resetToDefault}
            </button>
          )}
        </div>

        {/* Zones Legend */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">{t.prediction.glucoseZones}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{t.prediction.zones.normal}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{t.prediction.zones.moderate}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{t.prediction.zones.high}</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Prediction;
