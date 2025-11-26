import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import ABHARecordCard from '../../components/ABHARecordCard';
import Loader from '../../components/Loader';
import MicButton from '../../components/MicButton';
import { useABHA } from '../../context/ABHAContext';
import { queryHealthRecords } from '../../features/abha/mockABHAServices';

const sampleDoctors = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialty: 'Endocrinologist', hospital: 'Apollo Hospital', rating: 4.8 },
  { id: 2, name: 'Dr. Priya Sharma', specialty: 'Diabetologist', hospital: 'Max Healthcare', rating: 4.9 },
  { id: 3, name: 'Dr. Amit Patel', specialty: 'General Physician', hospital: 'Fortis Hospital', rating: 4.7 },
  { id: 4, name: 'Dr. Sunita Reddy', specialty: 'Endocrinologist', hospital: 'AIIMS Delhi', rating: 4.9 },
  { id: 5, name: 'Dr. Vikram Singh', specialty: 'Diabetologist', hospital: 'Medanta', rating: 4.8 },
];

const ABHA = () => {
  const { abhaProfile, healthRecords, isLinked, isLoading } = useABHA();
  const [voiceQuery, setVoiceQuery] = useState('');
  const [searchResults, setSearchResults] = useState(healthRecords);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleVoiceQuery = async (transcript: string) => {
    const { speak } = await import('../../features/voice/voiceHooks');
    setVoiceQuery(transcript);
    speak('Searching your health records');
    const results = await queryHealthRecords(transcript);
    setSearchResults(results);
    
    if (results.length > 0) {
      speak(`Found ${results.length} record${results.length > 1 ? 's' : ''}`);
    } else {
      speak('No records found for your query');
    }
  };

  const handleShareRecords = () => {
    if (!selectedDoctor) return;
    
    setShareSuccess(true);
    setTimeout(() => {
      setShowShareModal(false);
      setShareSuccess(false);
      setSelectedDoctor(null);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="large" text="Loading ABHA records..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="ABHA Health Records" 
        subtitle="Your complete health timeline"
      />

      <div className="p-6 space-y-6">
        {/* ABHA Profile */}
        {isLinked && abhaProfile && (
          <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{abhaProfile.name}</h3>
                <p className="text-white/90 mb-1">ABHA Number: {abhaProfile.abhaNumber}</p>
                <p className="text-white/90">ABHA Address: {abhaProfile.abhaAddress}</p>
              </div>
              <div className="text-4xl">✓</div>
            </div>
          </div>
        )}

        {/* Voice Query */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">🎤 Ask Your Health Records</h3>
          <p className="text-sm text-gray-600 mb-4">Use voice to query your medical history</p>
          
          <div className="flex justify-center mb-4">
            <MicButton onListen={handleVoiceQuery} size="medium" />
          </div>

          {voiceQuery && (
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-600">You asked:</p>
              <p className="font-medium text-primary-900">"{voiceQuery}"</p>
            </div>
          )}

          {/* Sample Queries */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Try asking:</p>
            <button 
              onClick={() => handleVoiceQuery('Show my last 3 reports')}
              className="text-sm text-primary-600 hover:underline block"
            >
              "Show my last 3 reports"
            </button>
            <button 
              onClick={() => handleVoiceQuery('What were my sugar levels last week')}
              className="text-sm text-primary-600 hover:underline block"
            >
              "What were my sugar levels last week?"
            </button>
          </div>
        </div>

        {/* Records List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Health Records</h3>
            <span className="text-sm text-gray-600">{searchResults.length} records</span>
          </div>

          <div className="space-y-3">
            {searchResults.map((record, index) => (
              <ABHARecordCard 
                key={index}
                record={record}
                onClick={() => console.log('Record clicked:', record)}
              />
            ))}
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={() => setShowShareModal(true)}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">📤</span>
          Share Records with Doctor
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Share with Doctor</h3>
              <button 
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedDoctor(null);
                  setShareSuccess(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {!shareSuccess ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a doctor to share your health records with
                  </p>

                  <div className="space-y-3">
                    {sampleDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedDoctor === doctor.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-primary-600">{doctor.specialty}</p>
                            <p className="text-sm text-gray-600">{doctor.hospital}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm font-medium">{doctor.rating}</span>
                            </div>
                          </div>
                          {selectedDoctor === doctor.id && (
                            <div className="text-primary-600 text-xl">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleShareRecords}
                      disabled={!selectedDoctor}
                      className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Share {searchResults.length} Record{searchResults.length > 1 ? 's' : ''}
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setSelectedDoctor(null);
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-xl font-bold text-green-600 mb-2">Records Shared Successfully!</h4>
                  <p className="text-gray-600">
                    Your health records have been securely shared with{' '}
                    {sampleDoctors.find(d => d.id === selectedDoctor)?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ABHA;
