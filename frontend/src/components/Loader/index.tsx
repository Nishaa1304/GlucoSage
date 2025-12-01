interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', text }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-16 h-16 border-3',
    large: 'w-24 h-24 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Neon glow spinner */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-aqua-200/30 border-t-aqua-500 rounded-full animate-spin shadow-glow-aqua`}
        ></div>
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-mint-200/20 border-b-mint-500 rounded-full animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-aqua-400/20 to-mint-400/20 animate-pulse"></div>
      </div>
      
      {text && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-aqua-500 rounded-full animate-bounce shadow-glow-sm"></div>
            <div className="w-1.5 h-1.5 bg-mint-500 rounded-full animate-bounce shadow-glow-sm" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce shadow-glow-sm" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-white text-sm font-medium animate-pulse drop-shadow-lg">{text}</p>
        </div>
      )}
    </div>
  );
};

export default Loader;
