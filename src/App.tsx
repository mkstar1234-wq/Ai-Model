import { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { BackdropEditor } from './components/BackdropEditor';
import { AIGenerator } from './components/AIGenerator';
import { LocalAIHub } from './components/LocalAIHub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles, Camera as CameraIcon, Upload, Wand2, ImagePlus, Terminal } from 'lucide-react';

type AppMode = 'landing' | 'camera' | 'bg-remover' | 'ai-generator' | 'ai-hub';

export default function App() {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<AppMode>('landing');
  const [targetTool, setTargetTool] = useState<'bg-remover' | null>(null);

  const processFile = (file: Blob, tool: 'bg-remover') => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Downscale if using background remover to prevent memory crashes
      if (tool === 'bg-remover') {
        const MAX_DIM = 800;
        if (img.width > MAX_DIM || img.height > MAX_DIM) {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              setImageBlob(blob);
              setMode(tool);
            }
          }, 'image/jpeg', 0.8);
          return;
        }
      }
      
      setImageBlob(file);
      setMode(tool);
    };
    img.src = objectUrl;
  };

  const handleCapture = (blob: Blob) => {
    if (targetTool) {
      processFile(blob, targetTool);
      setTargetTool(null);
    }
  };

  const resetToLanding = () => {
    setMode('landing');
    setImageBlob(null);
    setTargetTool(null);
  };

  if (mode === 'camera') {
    return (
      <ErrorBoundary sectionName="Camera Capture">
        <CameraCapture onCapture={handleCapture} onCancel={resetToLanding} />
      </ErrorBoundary>
    );
  }

  if (mode === 'bg-remover' && imageBlob) {
    return (
      <ErrorBoundary sectionName="Background Editor">
        <BackdropEditor imageBlob={imageBlob} onBack={resetToLanding} />
      </ErrorBoundary>
    );
  }

  if (mode === 'ai-generator') {
    return (
      <ErrorBoundary sectionName="AI Image Generator">
        <AIGenerator onBack={resetToLanding} />
      </ErrorBoundary>
    );
  }

  if (mode === 'ai-hub') {
    return (
      <ErrorBoundary sectionName="Local AI Hub">
        <LocalAIHub onBack={resetToLanding} />
      </ErrorBoundary>
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Studio Pro X
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            The ultimate all-in-one creative suite. AI Background Removal, Pro Photo Editing, and Free AI Image Generation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tool 6: Local AI Hub */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative z-10 group-hover:text-white transition-colors h-full flex flex-col">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 group-hover:bg-white/20 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors shrink-0">
                <Terminal className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3">100% Free AI Models Hub</h2>
              <p className="text-slate-500 group-hover:text-indigo-100 mb-8 transition-colors flex-1">
                Run local LLMs (Llama 3, Mistral, Phi-3), image generators (Flux, SD), and audio models natively. No API keys!
              </p>
              <button 
                onClick={() => setMode('ai-hub')}
                className="w-full py-3 mt-auto bg-slate-900 group-hover:bg-white group-hover:text-indigo-600 text-white rounded-xl font-medium transition-colors flex justify-center items-center space-x-2 shrink-0"
              >
                <Terminal className="w-5 h-5" /> <span>Open Hub</span>
              </button>
            </div>
          </div>

          {/* Tool 1: AI Background Remover */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shrink-0">
              <Wand2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-3">AI Background Replace</h2>
            <p className="text-slate-500 mb-8 flex-1">
              Perfect product cutouts. Instantly remove backgrounds and place your product in AI-generated sceneries.
            </p>
            <div className="space-y-3 mt-auto shrink-0">
              <button 
                onClick={() => { setTargetTool('bg-remover'); setMode('camera'); }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center space-x-2"
              >
                <CameraIcon className="w-5 h-5" /> <span>Use Camera</span>
              </button>
              <label className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex justify-center items-center space-x-2 cursor-pointer">
                <Upload className="w-5 h-5" /> <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) processFile(e.target.files[0], 'bg-remover');
                }} />
              </label>
            </div>
          </div>

          {/* Tool 3: AI Image Generator */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative z-10 group-hover:text-white transition-colors h-full flex flex-col">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 group-hover:bg-white/20 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors shrink-0">
                <ImagePlus className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI Image Generator</h2>
              <p className="text-slate-500 group-hover:text-purple-100 mb-8 transition-colors flex-1">
                Generate unlimited, high-quality images from text completely free. No API keys required.
              </p>
              <button 
                onClick={() => setMode('ai-generator')}
                className="w-full py-3 mt-auto bg-slate-900 group-hover:bg-white group-hover:text-purple-600 text-white rounded-xl font-medium transition-colors flex justify-center items-center space-x-2 shrink-0"
              >
                <Sparkles className="w-5 h-5" /> <span>Start Generating</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
