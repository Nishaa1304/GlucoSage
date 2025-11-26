import { PatientSummary } from '../../features/doctorView/doctorService';

interface PatientCardProps {
  patient: PatientSummary;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getRiskLevel = (alerts: number): { label: string; color: string } => {
    if (alerts >= 5) return { label: 'High Risk', color: 'bg-red-100 text-red-800 border-red-300' };
    if (alerts >= 3) return { label: 'Moderate Risk', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: 'Low Risk', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const riskLevel = getRiskLevel(patient.highAlerts);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
          <p className="text-sm text-gray-600">
            {patient.age} years • {patient.diagnosis}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${riskLevel.color}`}>
          {riskLevel.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Avg Sugar (7 days)</p>
          <p className="text-2xl font-bold text-blue-700">{patient.avgSugar}</p>
          <p className="text-xs text-gray-500">mg/dL</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">High Alerts</p>
          <p className="text-2xl font-bold text-orange-700">{patient.highAlerts}</p>
          <p className="text-xs text-gray-500">this week</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Last Reading:</span>
          <span className="text-sm font-semibold text-gray-900">
            {patient.lastReading.value} mg/dL
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Most Risky Meal:</span>
          <span className="text-sm font-semibold text-red-600">{patient.riskyMeal}</span>
        </div>
      </div>

      <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
        View Full ABHA Summary
      </button>
    </div>
  );
};

export default PatientCard;
