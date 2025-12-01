import { useNavigate } from 'react-router-dom';
import { APP_NAME, TAGLINE } from '../../utils/constants';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex flex-col items-center justify-center p-6 overflow-hidden relative" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="text-center relative z-10">
        {/* Logo with creative animation */}
        <div className="mb-8 mt-16 animate-fadeIn">
          <div className="relative inline-block">
            {/* Animated glow ring */}
            <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-30 animate-pulse scale-110"></div>
            
            {/* Logo container - larger and no float animation */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-6">
              <img 
                src="/glucosage_logo.png" 
                alt="GlucoSage Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => {
                  // Fallback to emoji if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-8xl md:text-9xl">🩺</div>';
                }}
              />
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-white font-medium animate-slideUp" style={{ animationDelay: '0.5s' }}>
            {TAGLINE}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-12 space-y-4 w-full max-w-md animate-slideUp" style={{ animationDelay: '0.7s' }}>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-primary-800 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate('/doctor')}
            className="w-full bg-transparent border-2 border-white text-white py-3 px-8 rounded-xl text-base font-medium hover:bg-white/10 active:scale-95 transition-all"
          >
            Continue as Doctor
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-white text-sm">
          Empowering diabetes management through voice
        </p>
      </div>
    </div>
  );
};

export default Splash;
