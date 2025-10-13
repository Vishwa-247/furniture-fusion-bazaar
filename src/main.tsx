import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ResumeProvider } from './context/ResumeContext';

createRoot(document.getElementById("root")!).render(
  <ResumeProvider>
    <App />
  </ResumeProvider>
);
