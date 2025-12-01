import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getTranslations } from '../../i18n/translations';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import Loader from '../../components/Loader';

const FoodScan = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const t = getTranslations(user?.language || 'en');
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup: stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  // Effect to handle video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current && isCameraOn) {
      console.log('Attaching stream to video element');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
    }
  }, [stream, isCameraOn]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Requesting camera access...');
      
      // Try to get user-facing camera first (most devices default to this)
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera access granted');
      console.log('Stream tracks:', mediaStream.getTracks());
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(`Unable to access camera: ${(error as Error).message}`);
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    // Draw video frame to canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Simulate processing delay
      setTimeout(() => {
        setIsCapturing(false);
        stopCamera();
        navigate('/scan/result', { state: { imageData } });
      }, 1500);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsCapturing(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        
        setTimeout(() => {
          setIsCapturing(false);
          stopCamera();
          navigate('/scan/result', { state: { imageData } });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <PageHeader 
        title={t.foodScan.title}
        subtitle={t.foodScan.subtitle}
        showBack={true}
      />

      <div className="max-w-3xl mx-auto p-6">
        {/* Camera Preview */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6" style={{ aspectRatio: '4/3', minHeight: '400px' }}>
          {isCameraOn && !capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Frame guide */}
              <div className="absolute inset-0 border-4 border-dashed border-white/30 m-8 rounded-xl pointer-events-none"></div>
              
              {/* Camera info overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-sm text-center">{t.foodScan.positionPlate}</p>
                {videoRef.current && (
                  <p className="text-white/70 text-xs text-center mt-1">
                    Stream: {stream?.active ? 'Active ✓' : 'Connecting...'} | 
                    Video: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}
                  </p>
                )}
              </div>
              
              {/* Camera control button */}
              <button
                onClick={toggleCamera}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
                title={t.foodScan.turnOffCamera}
              >
                <span className="text-xl">📷❌</span>
              </button>
            </>
          ) : !isCameraOn && !capturedImage ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white text-lg mb-2">{t.foodScan.cameraOff}</p>
                <p className="text-white/70 text-sm mb-4">{t.foodScan.turnOnCamera.toLowerCase()}</p>
                <button
                  onClick={toggleCamera}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  {t.foodScan.turnOnCamera}
                </button>
                {cameraError && (
                  <p className="text-red-400 text-sm mt-3">{cameraError}</p>
                )}
              </div>
            </div>
          ) : null}
          
          {isCapturing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <Loader size="large" text={t.foodScan.analyzing} />
            </div>
          )}
          
          {capturedImage && !isCapturing && (
            <img src={capturedImage} alt="Captured food" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">{t.foodScan.tipsTitle}</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {t.foodScan.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={toggleCamera}
            disabled={isCapturing}
            className={`w-full py-6 rounded-2xl text-lg font-semibold active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
              isCameraOn 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <span className="text-2xl">{isCameraOn ? '📷❌' : '📷✅'}</span>
            {isCameraOn ? t.foodScan.turnOffCamera : t.foodScan.turnOnCamera}
          </button>
          
          <button
            onClick={handleCapture}
            disabled={isCapturing || !isCameraOn}
            className="w-full bg-primary-600 text-white py-6 rounded-2xl text-lg font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📸</span>
            {isCapturing ? t.foodScan.analyzing : t.foodScan.capturePhoto}
          </button>
          
          <button
            onClick={handleBrowseClick}
            disabled={isCapturing}
            className="w-full bg-white border-3 border-primary-600 text-primary-600 py-6 rounded-2xl text-lg font-semibold hover:bg-primary-50 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🖼️</span>
            {t.foodScan.browseUpload}
          </button>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FoodScan;
