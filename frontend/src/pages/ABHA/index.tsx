import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import ABHARecordCard from '../../components/ABHARecordCard';
import Loader from '../../components/Loader';
import MicButton from '../../components/MicButton';
import { useABHA } from '../../context/ABHAContext';
import { useUser } from '../../context/UserContext';
import { abhaAPI } from '../../services/api';
import { getTranslations } from '../../i18n/translations';

const sampleDoctors = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialty: 'Endocrinologist', hospital: 'Apollo Hospital', rating: 4.8 },
  { id: 2, name: 'Dr. Priya Sharma', specialty: 'Diabetologist', hospital: 'Max Healthcare', rating: 4.9 },
  { id: 3, name: 'Dr. Amit Patel', specialty: 'General Physician', hospital: 'Fortis Hospital', rating: 4.7 },
  { id: 4, name: 'Dr. Sunita Reddy', specialty: 'Endocrinologist', hospital: 'AIIMS Delhi', rating: 4.9 },
  { id: 5, name: 'Dr. Vikram Singh', specialty: 'Diabetologist', hospital: 'Medanta', rating: 4.8 },
];

const ABHA = () => {
  const { user, updateUser } = useUser();
  const { abhaProfile, healthRecords, isLinked, isLoading, loadABHAData } = useABHA();
  const [voiceQuery, setVoiceQuery] = useState('');
  const [searchResults, setSearchResults] = useState(healthRecords);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingAbha, setLinkingAbha] = useState(false);
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  
  const t = getTranslations(user?.language || 'en');

  useEffect(() => {
    setSearchResults(healthRecords);
  }, [healthRecords]);

  const handleVoiceQuery = async (transcript: string) => {
    const { speak } = await import('../../features/voice/voiceHooks');
    setVoiceQuery(transcript);
    speak('Searching your health records');
    
    const lowerQuery = transcript.toLowerCase();
    
    // Filter records locally based on the query
    let filtered = healthRecords;
    
    if (lowerQuery.includes('sugar') || lowerQuery.includes('glucose') || lowerQuery.includes('blood sugar')) {
      filtered = healthRecords.filter(r => r.type === 'glucose');
    } else if (lowerQuery.includes('prescription') || lowerQuery.includes('medicine') || lowerQuery.includes('medication')) {
      filtered = healthRecords.filter(r => r.type === 'prescription');
    } else if (lowerQuery.includes('lab') || lowerQuery.includes('test')) {
      filtered = healthRecords.filter(r => r.type === 'lab');
    } else if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = healthRecords.filter(r => new Date(r.date) >= weekAgo);
    } else if (lowerQuery.includes('today')) {
      const today = new Date().toISOString().split('T')[0];
      filtered = healthRecords.filter(r => r.date === today);
    } else if (lowerQuery.includes('report') || lowerQuery.includes('record')) {
      // Extract number from query like "last 3 reports"
      const match = lowerQuery.match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 3;
      filtered = healthRecords.slice(0, count);
    }
    
    setSearchResults(filtered);
    
    if (filtered.length > 0) {
      speak(`Found ${filtered.length} record${filtered.length > 1 ? 's' : ''}`);
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

  const handleLinkAbha = async () => {
    if (!abhaNumber || !abhaAddress) {
      alert('Please enter both ABHA Number and ABHA Address');
      return;
    }

    setLinkingAbha(true);
    try {
      const response = await abhaAPI.linkABHA(abhaNumber, abhaAddress);
      if (response.data.success) {
        setShowLinkModal(false);
        alert(user?.language === 'hi' 
          ? 'ABHA खाता सफलतापूर्वक जोड़ा गया!' 
          : 'ABHA account linked successfully!');
        
        // Reload ABHA data
        await loadABHAData();
        
        // Clear inputs
        setAbhaNumber('');
        setAbhaAddress('');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to link ABHA account');
    } finally {
      setLinkingAbha(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <div className="particle-bg absolute inset-0"></div>
        <div className="relative z-10">
          <Loader size="large" text="Loading ABHA records..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      <div className="relative z-10">
        <PageHeader 
          title="ABHA Health Records" 
          subtitle="Your complete health timeline"
        />

        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Link ABHA if not already linked */}
          {!isLinked && (
            <div className="glass-card-solid border-2 border-aqua-300/50 shadow-glow-aqua animate-fadeIn">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-float">🏥</div>
                <h3 className="text-2xl font-bold text-gradient-health mb-3">{t.abha.notLinked}</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {user?.language === 'hi' 
                    ? 'अपने डिजिटल स्वास्थ्य रिकॉर्ड तक पहुंचने के लिए ABHA जोड़ें'
                    : 'Link your ABHA to access your digital health records'}
                </p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="btn-primary shadow-glow-aqua"
                >
                  {t.abha.linkAbha}
                </button>
              </div>
            </div>
          )}

        {/* ABHA Profile - Only show if linked */}
        {isLinked && abhaProfile && (
          <div className="glass-card bg-gradient-to-br from-aqua-500/20 to-mint-500/20 backdrop-blur-xl border border-white/30 text-white shadow-glow-lg animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">{abhaProfile.name}</h3>
                <div className="space-y-2">
                  <p className="text-white/90 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span>Age: <span className="font-bold">{abhaProfile.age}</span> years</span>
                  </p>
                  <p className="text-white/90 flex items-center gap-2">
                    <span className="text-lg">🆔</span>
                    <span>ABHA Number: <span className="font-mono font-bold">{abhaProfile.abhaNumber}</span></span>
                  </p>
                  <p className="text-white/90 flex items-center gap-2">
                    <span className="text-lg">📬</span>
                    <span>ABHA Address: <span className="font-mono font-bold">{abhaProfile.abhaAddress}</span></span>
                  </p>
                  <p className="text-white/70 text-sm mt-3 flex items-center gap-2">
                    <span>🔗</span>
                    <span>Linked: {new Date(abhaProfile.linkedDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-3xl shadow-glow-mint animate-pulse mb-2">
                  ✓
                </div>
                <span className="text-sm text-white/90 font-bold bg-white/20 px-3 py-1 rounded-full">Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Voice Query */}
        <div className="glass-card-solid border border-aqua-200/30 shadow-glow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-bold text-xl mb-4 text-gradient-health flex items-center gap-2">
            <span className="text-2xl animate-float">🎤</span>
            Ask Your Health Records
          </h3>
          <p className="text-sm text-gray-600 mb-6">Use voice to query your medical history</p>
          
          <div className="flex justify-center mb-6">
            <MicButton onListen={handleVoiceQuery} size="medium" />
          </div>

          {voiceQuery && (
            <div className="bg-gradient-to-r from-aqua-50/90 to-mint-50/90 border-2 border-aqua-300/50 rounded-2xl p-4 mt-4 shadow-glow-aqua animate-fadeIn">
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-aqua-500 rounded-full animate-pulse shadow-glow-sm"></span>
                You asked:
              </p>
              <p className="font-bold text-aqua-900 text-lg">"{voiceQuery}"</p>
            </div>
          )}

          {/* Sample Queries */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Try asking:</p>
            <button 
              onClick={() => handleVoiceQuery('Show my last 3 reports')}
              className="text-sm text-aqua-600 hover:text-aqua-700 font-medium block w-full text-left p-3 rounded-xl hover:bg-aqua-50 transition-all duration-300 border border-transparent hover:border-aqua-200"
            >
              💬 "Show my last 3 reports"
            </button>
            <button 
              onClick={() => handleVoiceQuery('What were my sugar levels last week')}
              className="text-sm text-aqua-600 hover:text-aqua-700 font-medium block w-full text-left p-3 rounded-xl hover:bg-aqua-50 transition-all duration-300 border border-transparent hover:border-aqua-200"
            >
              💬 "What were my sugar levels last week?"
            </button>
          </div>
        </div>

        {/* Records List */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-2xl font-bold text-gradient-health">Your Health Records</h3>
            <span className="text-sm text-white bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-bold border border-white/30 shadow-glow-sm">
              {searchResults.length} records
            </span>
          </div>

          <div className="space-y-4">
            {searchResults.map((record, index) => (
              <div key={index} className="animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
                <ABHARecordCard 
                  record={record}
                  onClick={() => console.log('Record clicked:', record)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={() => setShowShareModal(true)}
          className="w-full btn-primary py-5 text-lg font-bold flex items-center justify-center gap-3 shadow-glow-aqua animate-fadeIn"
          style={{ animationDelay: '0.4s' }}
        >
          <span className="text-2xl">📤</span>
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

      {/* Link ABHA Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {user?.language === 'hi' ? 'ABHA खाता जोड़ें' : 'Link ABHA Account'}
              </h3>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.abha.abhaNumber}
                </label>
                <input
                  type="text"
                  value={abhaNumber}
                  onChange={(e) => setAbhaNumber(e.target.value)}
                  placeholder={user?.language === 'hi' ? '14 अंकों का ABHA नंबर' : '14-digit ABHA number'}
                  maxLength={14}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.abha.abhaAddress}
                </label>
                <input
                  type="text"
                  value={abhaAddress}
                  onChange={(e) => setAbhaAddress(e.target.value)}
                  placeholder={user?.language === 'hi' ? 'yourname@abdm' : 'yourname@abdm'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleLinkAbha}
                  disabled={!abhaNumber && !abhaAddress}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      </div>
    </div>
  );
};

export default ABHA;
