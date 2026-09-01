const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove imports
content = content.replace(/import \{ ProPhotoEditor \} from '.\/components\/ProPhotoEditor';\n/, '');
content = content.replace(/import \{ AIChat \} from '.\/components\/AIChat';\n/, '');
content = content.replace(/import \{ AIVoice \} from '.\/components\/AIVoice';\n/, '');

// Clean up lucide-react imports if we want, but it's okay to leave unused ones or just replace
// SlidersHorizontal, MessageSquareText, Mic are no longer needed
content = content.replace(/SlidersHorizontal, /, '');
content = content.replace(/MessageSquareText, /, '');
content = content.replace(/Mic, /, '');

// Remove from AppMode type definition
content = content.replace(/ \| 'photo-editor'/, '');
content = content.replace(/ \| 'ai-chat'/, '');
content = content.replace(/ \| 'ai-voice'/, '');

// Remove component rendering logic
// if (mode === 'photo-editor' && imageBlob) {
//     return <ProPhotoEditor imageBlob={imageBlob} onBack={() => setMode('landing')} />;
// }
content = content.replace(/  if \(mode === 'photo-editor' && imageBlob\) \{\n    return <ProPhotoEditor imageBlob=\{imageBlob\} onBack=\{\(\) => setMode\('landing'\)\} \/>;\n  \}\n\n/, '');
content = content.replace(/  if \(mode === 'ai-chat'\) \{\n    return <AIChat onBack=\{\(\) => setMode\('landing'\)\} \/>;\n  \}\n\n/, '');
content = content.replace(/  if \(mode === 'ai-voice'\) \{\n    return <AIVoice onBack=\{\(\) => setMode\('landing'\)\} \/>;\n  \}\n\n/, '');

// Remove TargetTool types
content = content.replace(/const \[targetTool, setTargetTool\] = useState<'bg-remover' | 'photo-editor' | null>\(null\);/, `const [targetTool, setTargetTool] = useState<'bg-remover' | null>(null);`);
content = content.replace(/const processFile = \(file: Blob, tool: 'bg-remover' | 'photo-editor'\) => \{/, `const processFile = (file: Blob, tool: 'bg-remover') => {`);


// Remove Tool 2, Tool 4, Tool 5 from HTML
const removeBlock = (startRegex, endRegex) => {
    let startIdx = content.search(startRegex);
    if (startIdx === -1) return;
    let temp = content.substring(startIdx);
    let endIdx = temp.search(endRegex);
    if (endIdx === -1) return;
    content = content.substring(0, startIdx) + temp.substring(endIdx + temp.match(endRegex)[0].length);
};

removeBlock(/          \{\/\* Tool 2: Pro Photo Editor \*\/}/, /          <\/div>\n/);
removeBlock(/          \{\/\* Tool 4: AI Chat Knowledge \*\/}/, /          <\/div>\n/);
removeBlock(/          \{\/\* Tool 5: AI Voice Assistant \*\/}/, /          <\/div>\n/);

fs.writeFileSync('src/App.tsx', content);
