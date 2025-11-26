import { useNavigate } from 'react-router-dom';
import { APP_NAME, TAGLINE } from '../../utils/constants';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="text-center animate-fadeIn">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl md:text-8xl mb-4">🩺</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            {APP_NAME}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            {TAGLINE}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-12 space-y-4 w-full max-w-md">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-white text-primary-700 py-4 px-8 rounded-xl text-lg font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-2xl"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate('/doctor')}
            className="w-full bg-transparent border-3 border-white text-white py-4 px-8 rounded-xl text-lg font-semibold hover:bg-white/10 active:scale-95 transition-all"
          >
            Continue as Doctor
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-white/70 text-sm">
          Empowering diabetes management through voice
        </p>
      </div>
    </div>
  );
};

export default Splash;
