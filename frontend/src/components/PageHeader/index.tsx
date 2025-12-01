import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, showBack = false, action }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-glow border-b border-aqua-200/30 px-4 py-6 animate-slideDown">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-aqua-50 rounded-full transition-all duration-300 hover:shadow-glow-aqua hover:scale-110 group"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-aqua-600 group-hover:text-aqua-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gradient-health animate-fadeIn">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 animate-fadeIn" style={{ animationDelay: '0.1s' }}>{subtitle}</p>
              )}
            </div>
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className="btn-primary text-sm animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
