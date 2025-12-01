import { HealthRecord } from '../../features/abha/mockABHAServices';
import { formatDate } from '../../utils/formatters';

interface ABHARecordCardProps {
  record: HealthRecord;
  onClick?: () => void;
}

const ABHARecordCard: React.FC<ABHARecordCardProps> = ({ record, onClick }) => {
  const typeIcons = {
    glucose: '🩸',
    prescription: '💊',
    lab: '🔬',
    vitals: '❤️',
  };

  const typeColors = {
    glucose: 'bg-gradient-to-br from-glucose-50/90 to-red-50/90 border-glucose-300/50 text-glucose-800 hover:shadow-glow-glucose',
    prescription: 'bg-gradient-to-br from-medical-50/90 to-purple-50/90 border-medical-300/50 text-medical-800 hover:shadow-glow-medical',
    lab: 'bg-gradient-to-br from-aqua-50/90 to-blue-50/90 border-aqua-300/50 text-aqua-800 hover:shadow-glow-aqua',
    vitals: 'bg-gradient-to-br from-pink-50/90 to-glucose-50/90 border-pink-300/50 text-pink-800 hover:shadow-glow',
  };

  return (
    <div
      className={`p-5 rounded-2xl border-2 backdrop-blur-md ${typeColors[record.type]} cursor-pointer hover:scale-102 transform transition-all duration-300 animate-fadeIn group`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl animate-float group-hover:scale-110 transition-transform duration-300">
          {typeIcons[record.type]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg group-hover:text-gradient-health transition-all">{record.title}</h4>
            <span className="text-xs opacity-75 bg-white/50 px-2 py-1 rounded-full">{formatDate(record.date)}</span>
          </div>
          
          {record.value && (
            <p className="font-bold text-2xl mb-2 drop-shadow-sm">{record.value}</p>
          )}
          
          {record.details && (
            <p className="text-sm mb-2 leading-relaxed">{record.details}</p>
          )}
          
          {record.doctor && (
            <p className="text-xs opacity-75 flex items-center gap-1">
              <span>👨‍⚕️</span> 
              <span className="font-medium">{record.doctor}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABHARecordCard;
