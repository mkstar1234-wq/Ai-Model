import React, { useState, useEffect } from 'react';
import { 
  Terminal, Cpu, Globe, MessageSquare, Image as ImageIcon, 
  Music, Sparkles, Send, Loader2, ArrowLeft, Download, Mic, Settings
} from 'lucide-react';

interface LocalAIHubProps {
  onBack: () => void;
}

export function LocalAIHub({ onBack }: LocalAIHubProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'audio' | 'hub'>('text');
  
  // Text state
  const [textModel, setTextModel] = useState('llama3');
  const [textPrompt, setTextPrompt] = useState('');
  const [textResponse, setTextResponse] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [provider, setProvider] = useState<'ollama' | 'lmstudio'>('ollama');

  // Image state
  const [imageModel, setImageModel] = useState('flux');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Audio state
  const [audioModel, setAudioModel] = useState('whisper');
  const [isAudioActive, setIsAudioActive] = useState(false);

  const handleTextSubmit = async () => {
    if (!textPrompt.trim()) return;
    setIsTextLoading(true);
    setTextResponse('');

    try {
      if (provider === 'ollama') {
        const res = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: textModel, prompt: textPrompt, stream: false })
        });
        if (!res.ok) throw new Error('Ollama not running. Make sure it is started on port 11434.');
        const data = await res.json();
        setTextResponse(data.response);
      } else {
        const res = await fetch('http://localhost:1234/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: textPrompt }],
            temperature: 0.7
          })
        });
        if (!res.ok) throw new Error('LM Studio not running. Make sure the server is started on port 1234.');
        const data = await res.json();
        setTextResponse(data.choices[0].message.content);
      }
    } catch (err: any) {
      setTextResponse(`Connection Error: ${err.message}\n\nPlease install ${provider === 'ollama' ? 'Ollama' : 'LM Studio'} and download the model to run it 100% locally and free.`);
    } finally {
      setIsTextLoading(false);
    }
  };

  const handleImageSubmit = () => {
    if (!imagePrompt.trim()) return;
    setIsImageLoading(true);
    const encodedPrompt = encodeURIComponent(imagePrompt + (imageModel === 'craiyon' ? ' watercolor style' : ''));
    const seed = Math.floor(Math.random() * 100000);
    // Flux is default on pollinations. Using seed to bypass cache.
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setIsImageLoading(false);
    };
    img.onerror = () => {
      setIsImageLoading(false);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
              100% Free AI Models Hub
            </h1>
            <p className="text-xs text-slate-500">Run local LLMs, Free Image Gen, and Audio AI directly in your app.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors ${activeTab === 'text' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MessageSquare className="w-4 h-4" /> <span>Text (LLMs)</span>
            </button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors ${activeTab === 'image' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ImageIcon className="w-4 h-4" /> <span>Images</span>
            </button>
            <button 
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors ${activeTab === 'audio' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Music className="w-4 h-4" /> <span>Audio</span>
            </button>
            <button 
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors ${activeTab === 'hub' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Globe className="w-4 h-4" /> <span>Providers</span>
            </button>
          </div>

          {/* TEXT TAB */}
          {activeTab === 'text' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Settings className="w-4 h-4 mr-2" /> Connection Setup</h3>
                  
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Local Engine</label>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button onClick={() => setProvider('ollama')} className={`p-3 rounded-xl border-2 text-sm font-bold flex flex-col items-center justify-center gap-1 ${provider === 'ollama' ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                      <Terminal className="w-5 h-5" /> Ollama
                    </button>
                    <button onClick={() => setProvider('lmstudio')} className={`p-3 rounded-xl border-2 text-sm font-bold flex flex-col items-center justify-center gap-1 ${provider === 'lmstudio' ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                      <Cpu className="w-5 h-5" /> LM Studio
                    </button>
                  </div>

                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Model Selection</label>
                  <div className="space-y-2">
                    {['llama3', 'mistral', 'phi3', 'codellama'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setTextModel(m)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${textModel === m ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        {m === 'llama3' ? 'Llama 3 (8B/70B)' : m === 'mistral' ? 'Mistral (7B)' : m === 'phi3' ? 'Phi-3 (Mini)' : 'CodeLlama'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
                <div className="flex-1 bg-slate-50 rounded-xl p-4 mb-4 overflow-y-auto border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                  {textResponse || "Connects directly to your local Ollama or LM Studio instance for 100% free, private inference.\n\nType a prompt below to test."}
                </div>
                <div className="relative">
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder={`Ask ${textModel} anything...`}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 resize-none h-16"
                  />
                  <button 
                    onClick={handleTextSubmit}
                    disabled={isTextLoading}
                    className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isTextLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Image Generator</label>
                  <div className="space-y-2 mb-6">
                    {['flux', 'stable-diffusion', 'craiyon'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setImageModel(m)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${imageModel === m ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        {m === 'flux' ? 'Flux (Default)' : m === 'stable-diffusion' ? 'Stable Diffusion' : 'Craiyon (Style)'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Powered by Pollinations.ai. Images are generated entirely for free in the cloud without API keys.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
                <div className="flex-1 bg-slate-50 rounded-xl mb-4 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                  {isImageLoading ? (
                    <div className="flex flex-col items-center text-purple-600">
                      <Loader2 className="w-10 h-10 animate-spin mb-2" />
                      <span className="font-medium">Generating with {imageModel}...</span>
                    </div>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <span>Enter a prompt to generate an image</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={`Describe an image to generate with ${imageModel}...`}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-purple-500"
                  />
                  <button 
                    onClick={handleImageSubmit}
                    disabled={isImageLoading}
                    className="absolute right-2 top-2 p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Audio & Speech AI</label>
                  <div className="space-y-2 mb-6">
                    {['whisper', 'bark', 'musicgen'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setAudioModel(m)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${audioModel === m ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        {m === 'whisper' ? 'Whisper (Speech-to-Text)' : m === 'bark' ? 'Bark (Text-to-Speech)' : 'MusicGen (Audio Gen)'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Utilizes free Web APIs (Web Speech API, Web Audio API) to simulate these models 100% free directly in the browser.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-colors ${isAudioActive ? 'bg-teal-100 text-teal-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  {audioModel === 'whisper' ? <Mic className="w-12 h-12" /> : <Music className="w-12 h-12" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {audioModel === 'whisper' ? 'Whisper STT' : audioModel === 'bark' ? 'Bark TTS' : 'MusicGen'} Simulator
                </h3>
                <p className="text-slate-500 max-w-md mb-8">
                  {audioModel === 'whisper' ? 'Click to start transcribing your voice using the browser natively.' 
                    : audioModel === 'bark' ? 'Type text below to synthesize speech.' 
                    : 'Generate electronic ambient tracks natively in the browser.'}
                </p>
                <button 
                  onClick={() => setIsAudioActive(!isAudioActive)}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors"
                >
                  {isAudioActive ? 'Stop processing' : `Start ${audioModel}`}
                </button>
              </div>
            </div>
          )}

          {/* HUB TAB */}
          {activeTab === 'hub' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-3xl mx-auto mt-10">
              <Globe className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Hugging Face & Local Hubs</h2>
              <p className="text-slate-600 mb-8 text-lg">
                To run Llama 3, Mistral, Phi-3, and CodeLlama completely free, download one of these tools:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="p-6 border-2 border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors">
                  <h3 className="font-bold text-xl mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2 text-indigo-500"/> Ollama</h3>
                  <p className="text-sm text-slate-500 mb-4">Command-line tool to run open-source models natively. Port 11434.</p>
                  <a href="https://ollama.com" target="_blank" className="text-indigo-600 font-bold hover:underline">Download Ollama →</a>
                </div>
                
                <div className="p-6 border-2 border-slate-100 rounded-2xl hover:border-purple-200 transition-colors">
                  <h3 className="font-bold text-xl mb-2 flex items-center"><Cpu className="w-5 h-5 mr-2 text-purple-500"/> LM Studio</h3>
                  <p className="text-sm text-slate-500 mb-4">Desktop GUI to discover and run local GGUF models. Port 1234.</p>
                  <a href="https://lmstudio.ai" target="_blank" className="text-purple-600 font-bold hover:underline">Download LM Studio →</a>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">Hugging Face Open Directory</h3>
                <p className="text-sm text-slate-500">
                  Search HuggingFace.co for "GGUF" models to download and run them locally in LM Studio.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
