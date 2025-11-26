import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavProps {
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
  { id: 'scan', label: 'Scan', icon: '🍽', path: '/scan' },
  { id: 'prediction', label: 'Trend', icon: '📊', path: '/prediction' },
  { id: 'abha', label: 'Records', icon: '📁', path: '/abha' },
];

const BottomNav: React.FC<BottomNavProps> = ({ items = defaultItems }) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary-600 rounded-full mt-1"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
