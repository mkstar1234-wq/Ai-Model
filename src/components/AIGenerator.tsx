import { useState } from 'react';
import { Download, Sparkles, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';

interface AIGeneratorProps {
  onBack: () => void;
}

export function AIGenerator({ onBack }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Using Pollinations AI - 100% Free, No API Key required
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setIsGenerating(false);
    };
    img.onerror = () => {
      setIsGenerating(false);
      alert('Failed to generate image. Please try again.');
    };
    img.src = url;
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">Free AI Image Generator</h2>
        </div>
        {imageUrl && (
          <button
            onClick={downloadImage}
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
            Describe what you want to see
          </h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic city at sunset, cyberpunk style, highly detailed..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && generateImage()}
            />
            <button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span>Generate</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Powered by completely free, unlimited AI models.</p>
        </div>

        <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden relative min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center text-slate-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium">Creating your masterpiece...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="AI Generated" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>Your generated image will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
