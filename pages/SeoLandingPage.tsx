import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO_PRESETS } from '../lib/seoPresets';
import { FormPage } from './FormPage';

export const SeoLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const config = SEO_PRESETS[slug || ''];

  // Update Metadata title for SEO (Client-side simulation)
  useEffect(() => {
    if (config) {
      document.title = `${config.title} | CourrierCarré`;
      // In a real SSR app, we would set meta description here too
    }
  }, [config]);

  if (!config) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* SEO HEADER / BREADCRUMBS */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
           {/* Breadcrumbs */}
           <nav className="flex text-xs text-slate-500 mb-4">
              <Link to="/" className="hover:text-blue-600">Accueil</Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-slate-800">{config.type === 'resiliation' ? 'Résiliation' : 'Modèles'}</span>
              <span className="mx-2">/</span>
              <span className="text-blue-600">{config.h1}</span>
           </nav>

           <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
             {config.h1}
           </h1>
           
           <div className="space-y-4 max-w-2xl text-slate-600 leading-relaxed text-sm md:text-base">
             {config.content.map((paragraph, idx) => (
               <p key={idx}>{paragraph}</p>
             ))}
           </div>
           
           <div className="mt-6 flex flex-wrap gap-2">
             <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100 font-medium">
               ✅ Certifié conforme 2025
             </span>
             <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-100 font-medium">
               🛡️ Protection Juridique Incluse
             </span>
           </div>
        </div>
      </div>

      {/* EMBEDDED FORM */}
      <div className="-mt-8 pb-10">
         <FormPage initialType={config.type} initialPreset={config.presetKey} embedded={true} />
      </div>

    </div>
  );
};