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
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
