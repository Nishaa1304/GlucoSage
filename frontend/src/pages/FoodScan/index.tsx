import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BottomNav from '../../components/BottomNav';
import Loader from '../../components/Loader';

const FoodScan = () => {
  const navigate = useNavigate();
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      setCameraError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title="Scan Your Food" 
        subtitle="Capture or upload your meal photo"
        showBack={true}
      />

      <div className="p-6">
        {/* Camera Preview */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6" style={{ aspectRatio: '4/3' }}>
          {isCameraOn && !capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Frame guide */}
              <div className="absolute inset-0 border-4 border-dashed border-white/30 m-8 rounded-xl pointer-events-none"></div>
              
              {/* Camera info overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-sm text-center">Position your plate in the frame</p>
              </div>
              
              {/* Camera control button */}
              <button
                onClick={toggleCamera}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
                title="Turn off camera"
              >
                <span className="text-xl">📷❌</span>
              </button>
            </>
          ) : !isCameraOn && !capturedImage ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white text-lg mb-2">Camera is Off</p>
                <p className="text-white/70 text-sm mb-4">Turn on camera to scan your food</p>
                <button
                  onClick={toggleCamera}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  Turn On Camera
                </button>
                {cameraError && (
                  <p className="text-red-400 text-sm mt-3">{cameraError}</p>
                )}
              </div>
            </div>
          ) : null}
          
          {isCapturing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <Loader size="large" text="Analyzing..." />
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
              <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Show the entire plate</li>
                <li>• Avoid shadows on food</li>
                <li>• Or upload a clear photo from gallery</li>
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
            {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          
          <button
            onClick={handleCapture}
            disabled={isCapturing || !isCameraOn}
            className="w-full bg-primary-600 text-white py-6 rounded-2xl text-lg font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📸</span>
            {isCapturing ? 'Analyzing...' : 'Capture Photo'}
          </button>
          
          <button
            onClick={handleBrowseClick}
            disabled={isCapturing}
            className="w-full bg-white border-3 border-primary-600 text-primary-600 py-6 rounded-2xl text-lg font-semibold hover:bg-primary-50 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🖼️</span>
            Browse & Upload Photo
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
