import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getGreeting } from '../../utils/formatters';
import { SAMPLE_VOICE_COMMANDS } from '../../utils/constants';
import MicButton from '../../components/MicButton';
import BottomNav from '../../components/BottomNav';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleVoiceCommand = async (transcript: string) => {
    const { parseVoiceCommand, speak } = await import('../../features/voice/voiceHooks');
    const command = parseVoiceCommand(transcript);
    
    if (command) {
      switch (command.intent) {
        case 'scan':
          speak('Opening food scanner');
          setTimeout(() => navigate('/scan'), 1000);
          break;
        case 'prediction':
          speak('Showing your glucose predictions');
          setTimeout(() => navigate('/prediction'), 1000);
          break;
        case 'abha':
          speak('Opening your health records');
          setTimeout(() => navigate('/abha'), 1000);
          break;
        default:
          speak('I did not understand that command. Please try again.');
          console.log('Unknown command:', transcript);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name} ji 👋
        </h1>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4">
          <p className="text-lg font-medium">Your sugar seems stable today.</p>
          <p className="text-sm mt-1 opacity-90">Last reading: 125 mg/dL • 2 hours ago</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Mic Button Section */}
        <div className="mb-8 mt-8">
          <div className="flex justify-center mb-6">
            <MicButton onListen={handleVoiceCommand} size="large" />
          </div>
          
          <p className="text-center text-gray-600 mb-6 text-lg font-medium">
            Try saying...
          </p>
        </div>

        {/* Sample Voice Commands */}
        <div className="space-y-3 mb-8">
          {SAMPLE_VOICE_COMMANDS.map((command, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100 hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => handleVoiceCommand(command)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <p className="text-gray-700 font-medium">"{command}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/scan')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-300"
          >
            <div className="text-4xl mb-2">🍽</div>
            <div className="font-semibold text-gray-800">Scan Food</div>
            <div className="text-sm text-gray-600 mt-1">Analyze your meal</div>
          </button>

          <button
            onClick={() => navigate('/prediction')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-300"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="font-semibold text-gray-800">View Trends</div>
            <div className="text-sm text-gray-600 mt-1">Check predictions</div>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
