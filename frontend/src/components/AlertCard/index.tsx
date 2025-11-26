interface AlertCardProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, message, icon }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const defaultIcons = {
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${typeStyles[type]} animate-fadeIn`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon || defaultIcons[type]}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{title}</h4>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
