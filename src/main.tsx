import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Suppress known React warnings from 3rd party library (react-filerobot-image-editor)
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
  if (
    (msg.includes('React does not recognize the') || msg.includes('for a non-boolean attribute')) &&
    /(isCollapsed|iscollapsed|noMargin|nomargin|showBackButton|showbackbutton|isPhoneScreen|isphonescreen|hasChildren|haschildren|isAccordion|isaccordion|showTabsDrawer|showtabsdrawer|active|hideEllipsis|hideellipsis|isValueExists|isvalueexists|fullWidth|fullwidth|watermarkTool|watermarktool)/i.test(msg)
  ) {
    return;
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary sectionName="Application">
    <App />
  </ErrorBoundary>
);
