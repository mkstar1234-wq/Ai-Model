import React from "react";
import { Camera, RefreshCw, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API is not supported in your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Camera permission denied or camera not found.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            stopCamera();
            onCapture(blob);
          }
        }, 'image/png');
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-center p-6 space-y-4 text-slate-800">
        <div className="bg-red-100 text-red-600 p-4 rounded-full mb-2">
          <Camera className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Camera Access Denied</h2>
        <p className="text-slate-600 max-w-sm mb-6">
          {error || 'Please allow camera access in your browser to take photos, or upload an existing photo from your device.'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={startCamera}
            className="px-6 py-3 w-full sm:w-auto bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
            Try Camera Again
          </button>
          
          <label className="flex items-center justify-center space-x-2 px-6 py-3 w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-900 rounded-full font-medium hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <Upload className="w-5 h-5" />
            <span>Upload Photo Instead</span>
          </label>
        </div>
        
        <button onClick={onCancel} className="mt-8 text-slate-500 hover:text-slate-700 underline text-sm font-medium">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      <div className="absolute inset-x-0 top-0 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-white font-medium text-lg drop-shadow-md">Product Capture</h1>
        <button
          onClick={toggleCamera}
          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 pb-10 md:p-8 md:pb-12 flex justify-center items-center bg-gradient-to-t from-black/50 to-transparent">
        <button
          onClick={handleCapture}
          className="relative group focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full"
        >
          <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
}
