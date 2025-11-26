interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', text }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      ></div>
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loader;
