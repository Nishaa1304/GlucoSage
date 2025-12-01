import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getTranslations } from '../../i18n/translations';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavProps {
  items?: NavItem[];
}

const BottomNav: React.FC<BottomNavProps> = ({ items }) => {
  const location = useLocation();
  const { user } = useUser();
  const t = getTranslations(user?.language || 'en');
  
  const defaultItems: NavItem[] = [
    { id: 'home', label: t.nav.home, icon: '🏠', path: '/home' },
    { id: 'scan', label: t.nav.scan, icon: '🍽', path: '/scan' },
    { id: 'prediction', label: t.nav.trend, icon: '📊', path: '/prediction' },
    { id: 'abha', label: t.nav.records, icon: '📁', path: '/abha' },
  ];
  
  const navItems = items || defaultItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-aqua-200/30 shadow-glow z-50 animate-slideUp">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  isActive
                    ? 'bg-gradient-to-br from-aqua-500/20 to-mint-500/20 text-aqua-600 shadow-glow-aqua'
                    : 'text-gray-600 hover:bg-aqua-50/50'
                }`}
              >
                <span className={`text-2xl ${
                  isActive ? 'animate-float' : ''
                }`}>{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-8 h-1 bg-gradient-to-r from-aqua-500 to-mint-500 rounded-full mt-1 shadow-glow-sm"></div>
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
