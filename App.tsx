import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { FormPage } from './pages/FormPage';
import { PreviewPage } from './pages/PreviewPage';
import { SuccessPage } from './pages/SuccessPage';
import { CGVPage } from './pages/CGVPage';
import { SeoLandingPage } from './pages/SeoLandingPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Routes standards (Outils) */}
          <Route path="/form" element={<FormPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cgv" element={<CGVPage />} />

          {/* Routes SEO (Pages Piliers) */}
          <Route path="/modele/:slug" element={<SeoLandingPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <SpeedInsights />
    </HashRouter>
  );
};

export default App;