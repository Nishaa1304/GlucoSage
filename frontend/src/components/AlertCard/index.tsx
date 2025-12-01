interface AlertCardProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, message, icon }) => {
  const typeStyles = {
    success: 'bg-gradient-to-br from-mint-50/90 to-green-50/90 border-mint-300/50 text-mint-800 shadow-glow-mint',
    warning: 'bg-gradient-to-br from-yellow-50/90 to-orange-50/90 border-yellow-300/50 text-yellow-800 shadow-glow-sm',
    danger: 'bg-gradient-to-br from-red-50/90 to-glucose-50/90 border-red-300/50 text-red-800 shadow-glow-glucose',
    info: 'bg-gradient-to-br from-aqua-50/90 to-blue-50/90 border-aqua-300/50 text-aqua-800 shadow-glow-aqua',
  };

  const defaultIcons = {
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️',
  };

  return (
    <div className={`p-5 rounded-2xl border-2 backdrop-blur-md ${typeStyles[type]} animate-fadeIn hover:scale-102 transform transition-all duration-300`}>
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0 animate-float">{icon || defaultIcons[type]}</span>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2 drop-shadow-sm">{title}</h4>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
