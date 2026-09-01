import React from "react";
import { Download, Loader2, ArrowLeft, Image as ImageIcon, Sparkles, Palette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';

interface BackdropEditorProps {
  imageBlob: Blob;
  onReset: () => void;
}

type BackgroundOption = { id: string; label: string; style: React.CSSProperties; class: string; };
const BACKGROUNDS: BackgroundOption[] = [
  { id: 'transparent', label: 'Transparent', style: { background: 'transparent' }, class: 'bg-white/10 relative overflow-hidden checkerboard' },
  { id: 'white', label: 'Pure White', style: { background: '#ffffff' }, class: 'bg-white border border-slate-200' },
  { id: 'black', label: 'Studio Black', style: { background: '#0a0a0a' }, class: 'bg-zinc-950 border border-zinc-800' },
  { id: 'warm', label: 'Warm Neutral', style: { background: '#f5f0eb' }, class: 'bg-[#f5f0eb] border border-slate-200' },
  { id: 'cool', label: 'Cool Stone', style: { background: '#e2e4e9' }, class: 'bg-[#e2e4e9] border border-slate-200' },
  { id: 'gradient-blue', label: 'Blue Aura', style: { background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' }, class: 'bg-gradient-to-br from-sky-100 to-sky-200 border border-sky-300' },
  { id: 'gradient-peach', label: 'Soft Peach', style: { background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)' }, class: 'bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300' },
];

export function BackdropEditor({ imageBlob, onReset }: BackdropEditorProps) {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const processingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Initializing AI Engine...');
  const [error, setError] = useState<string | null>(null);
  
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[1]);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'colors' | 'ai'>('colors');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerateAiBg = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiBg(true);
    
    const encodedPrompt = encodeURIComponent(aiPrompt.trim() + " background, product photography, studio lighting");
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    const img = new Image();
    img.onload = () => {
      setCustomBgImage(url);
      setSelectedBg({
        id: 'custom',
        label: 'AI Generated',
        style: { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' },
        class: 'border border-slate-300'
      });
      setIsGeneratingAiBg(false);
    };
    img.onerror = () => {
      setIsGeneratingAiBg(false);
      alert('Failed to generate background. Try a different prompt.');
    };
    img.src = url;
  };

  useEffect(() => {
    let isMounted = true;
    
    const processImage = async () => {
      if (processingRef.current) return;
      processingRef.current = true;
      
      try {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setProgressText('Loading AI model (this happens once)...');
        
        const config: Config = {
          publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
          model: 'isnet_quint8', // Low memory model to prevent crashes
          output: {
            format: 'image/png',
            quality: 1
          },
          progress: (key: string, current: number, total: number) => {
             if (total > 0 && isMounted) {
               const percent = Math.round((current / total) * 100);
               setProgress(percent);
               if (key.includes('fetch')) {
                 setProgressText(`Downloading AI Model (${percent}%)...`);
               } else if (key.includes('compute')) {
                 setProgressText(`Processing Image (${percent}%)...`);
               } else {
                 setProgressText(`Working (${percent}%)...`);
               }
             }
          }
        };

        const resultBlob = await removeBackground(imageBlob, config);
        
        if (isMounted) {
          const url = URL.createObjectURL(resultBlob);
          urlRef.current = url;
          setProcessedImageUrl(url);
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('Error removing background:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to process image. Memory might be full.');
          setIsProcessing(false);
        }
      } finally {
        if (isMounted) {
          processingRef.current = false;
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, [imageBlob]);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBgImage(url);
      setSelectedBg({
        id: 'custom',
        label: 'Custom Image',
        style: { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' },
        class: 'border border-slate-300'
      });
    }
  };

  const handleDownload = () => {
    if (!processedImageUrl || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the product image to get natural dimensions
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background
      if (selectedBg.id === 'transparent') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBg.id === 'custom' && customBgImage) {
        const bgImg = new Image();
        bgImg.onload = () => {
          // Fill logic to cover
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
          const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
          
          // Draw product on top
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          triggerDownload(canvas.toDataURL('image/png'));
        };
        bgImg.src = customBgImage;
        return;
      } else {
        ctx.fillStyle = selectedBg.style.background as string;
        
        // Handle gradients (simple approximation for now, or just fill solid if complex)
        if ((selectedBg.style.background as string)?.includes('linear-gradient')) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          if (selectedBg.id === 'gradient-blue') {
             grad.addColorStop(0, '#e0f2fe');
             grad.addColorStop(1, '#bae6fd');
          } else {
             grad.addColorStop(0, '#ffedd5');
             grad.addColorStop(1, '#fed7aa');
          }
          ctx.fillStyle = grad;
        }
        
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw product
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      triggerDownload(canvas.toDataURL('image/png'));
    };
    img.src = processedImageUrl;
  };

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `product-backdrop-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">Edit Backdrop</h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={isProcessing || !!error}
          className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Save Image</span>
        </button>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Canvas Area */}
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center bg-slate-100 relative overflow-hidden">
          
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200">
              <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse mb-4" />
              <h3 className="text-lg font-medium text-slate-800">{progressText}</h3>
              <p className="text-slate-500 text-sm mt-1">This runs entirely on your device for privacy.</p>
              
              <div className="w-64 h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button 
                onClick={onReset}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="relative w-full max-w-2xl aspect-[3/4] md:aspect-square lg:aspect-[4/3] rounded-lg shadow-xl overflow-hidden transition-all duration-300 checkerboard-bg"
              style={selectedBg.style}
            >
              {processedImageUrl && (
                <img 
                  src={processedImageUrl} 
                  alt="Processed Product" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xl"
                />
              )}
            </div>
          )}
          
          {/* Hidden canvas for saving */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Sidebar Controls */}
        <aside className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col overflow-hidden flex-none max-h-[50%] md:max-h-full shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] md:shadow-none z-10">
          
          <div className="flex border-b border-slate-200 p-2 shrink-0 mt-4 mx-4 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${activeTab === 'colors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Palette className="w-4 h-4 mr-2" /> Colors
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sparkles className="w-4 h-4 mr-2" /> AI Generate
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'colors' ? (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Backdrop Options</h3>
                <div className="grid grid-cols-4 md:grid-cols-3 gap-3">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg)}
                      className={`group relative flex flex-col items-center space-y-2 p-2 rounded-xl transition-all ${selectedBg.id === bg.id ? 'bg-indigo-50 ring-2 ring-indigo-500 ring-offset-1' : 'hover:bg-slate-50'}`}
                      title={bg.label}
                    >
                      <div className={`w-12 h-12 rounded-full shadow-sm ${bg.class}`} style={bg.id === 'transparent' ? {} : bg.style} />
                      <span className={`text-[11px] font-medium text-center ${selectedBg.id === bg.id ? 'text-indigo-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {bg.label}
                      </span>
                    </button>
                  ))}

                  <label className={`cursor-pointer group relative flex flex-col items-center justify-center space-y-2 p-2 rounded-xl transition-all ${selectedBg.id === 'custom' && !customBgImage?.includes('pollinations') ? 'bg-indigo-50 ring-2 ring-indigo-500 ring-offset-1' : 'hover:bg-slate-50'}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCustomBgUpload} />
                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center group-hover:border-slate-400 group-hover:bg-slate-100 transition-colors">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className={`text-[11px] font-medium text-center ${selectedBg.id === 'custom' && !customBgImage?.includes('pollinations') ? 'text-indigo-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      Custom
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-6 flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" />
                  <p className="text-sm font-medium">Generate a completely custom AI background for your product. 100% Free.</p>
                </div>
                
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Prompt</h3>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A wooden table in a sunny forest with soft morning light..."
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-4 resize-none"
                />
                
                <button
                  onClick={handleGenerateAiBg}
                  disabled={isGeneratingAiBg || !aiPrompt.trim()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGeneratingAiBg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>{isGeneratingAiBg ? 'Generating Background...' : 'Generate Background'}</span>
                </button>
              </div>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}
