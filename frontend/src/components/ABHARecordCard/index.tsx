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
    glucose: 'bg-red-50 border-red-200 text-red-800',
    prescription: 'bg-purple-50 border-purple-200 text-purple-800',
    lab: 'bg-blue-50 border-blue-200 text-blue-800',
    vitals: 'bg-pink-50 border-pink-200 text-pink-800',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${typeColors[record.type]} cursor-pointer hover:shadow-md transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{typeIcons[record.type]}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-lg">{record.title}</h4>
            <span className="text-xs opacity-75">{formatDate(record.date)}</span>
          </div>
          
          {record.value && (
            <p className="font-bold text-xl mb-1">{record.value}</p>
          )}
          
          {record.details && (
            <p className="text-sm mb-2">{record.details}</p>
          )}
          
          {record.doctor && (
            <p className="text-xs opacity-75">👨‍⚕️ {record.doctor}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABHARecordCard;
