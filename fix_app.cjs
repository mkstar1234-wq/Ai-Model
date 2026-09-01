const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const tools = `
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

          {/* Tool 2: Pro Photo Editor */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shrink-0">
              <SlidersHorizontal className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Pro Photo Editor</h2>
            <p className="text-slate-500 mb-8 flex-1">
              Advanced adjustments, filters, cropping, and color grading. Enhance your photos locally with zero latency.
            </p>
            <div className="space-y-3 mt-auto shrink-0">
              <button 
                onClick={() => { setTargetTool('photo-editor'); setMode('camera'); }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center space-x-2"
              >
                <CameraIcon className="w-5 h-5" /> <span>Use Camera</span>
              </button>
              <label className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex justify-center items-center space-x-2 cursor-pointer">
                <Upload className="w-5 h-5" /> <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) processFile(e.target.files[0], 'photo-editor');
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

          {/* Tool 4: AI Chat Knowledge */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative z-10 group-hover:text-white transition-colors h-full flex flex-col">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 group-hover:bg-white/20 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors shrink-0">
                <MessageSquareText className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI Chat Knowledge</h2>
              <p className="text-slate-500 group-hover:text-rose-100 mb-8 transition-colors flex-1">
                Chat with a 100% free AI. Ask questions, generate text, and explore knowledge without any API keys.
              </p>
              <button 
                onClick={() => setMode('ai-chat')}
                className="w-full py-3 mt-auto bg-slate-900 group-hover:bg-white group-hover:text-rose-600 text-white rounded-xl font-medium transition-colors flex justify-center items-center space-x-2 shrink-0"
              >
                <Sparkles className="w-5 h-5" /> <span>Start Chatting</span>
              </button>
            </div>
          </div>

          {/* Tool 5: AI Voice Assistant */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative z-10 group-hover:text-white transition-colors h-full flex flex-col">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 group-hover:bg-white/20 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors shrink-0">
                <Mic className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI Voice Assistant</h2>
              <p className="text-slate-500 group-hover:text-teal-100 mb-8 transition-colors flex-1">
                Talk to the AI with your voice and listen to its replies. 100% free and fully functional directly in your browser.
              </p>
              <button 
                onClick={() => setMode('ai-voice')}
                className="w-full py-3 mt-auto bg-slate-900 group-hover:bg-white group-hover:text-teal-600 text-white rounded-xl font-medium transition-colors flex justify-center items-center space-x-2 shrink-0"
              >
                <Mic className="w-5 h-5" /> <span>Start Talking</span>
              </button>
            </div>
          </div>
`;

content = content.replace(/        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<\/div>/, `        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n${tools}\n        </div>`);
fs.writeFileSync('src/App.tsx', content);
