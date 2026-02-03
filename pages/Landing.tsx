import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { generatePDF } from '../lib/pdfGenerator';
import { LetterType, FormData } from '../types';
import { PostalNudge } from '../components/ui/PostalNudge';

const Card = ({ title, desc, icon, to, color, colorName }: { title: string, desc: string, icon: React.ReactNode, to: string, color: string, colorName: string }) => (
  <Link 
    to={to}
    className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorName}-100/50 blur-3xl -mr-10 -mt-10 rounded-full group-hover:bg-${colorName}-100 transition-all`}></div>
    
    <div className={`w-12 h-12 rounded-lg bg-${colorName}-50 border border-${colorName}-100 flex items-center justify-center text-${colorName}-600 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>

    <div className="mt-auto pt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
      Commencer <span className="ml-1">→</span>
    </div>
  </Link>
);

const Feature = ({ title, desc, icon, colorClass }: { title: string, desc: string, icon: React.ReactNode, colorClass: string }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className={`w-16 h-16 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">{desc}</p>
  </div>
);

// Updated to take a slug instead of just query params
const BrandButton = ({ name, slug, color, popular }: { name: string, slug: string, color: string, popular?: boolean }) => (
  <Link 
    to={`/modele/${slug}`}
    className="relative flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-lg p-3 transition-all group overflow-hidden shadow-sm hover:shadow-md"
  >
    {popular && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg shadow-sm z-10" title="Très demandé"></div>
    )}
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${color} shadow-sm`}>
      {name.substring(0, 1)}
    </div>
    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{name}</span>
    
    {/* Arrow subtle appear on hover */}
    <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
  </Link>
);

export const Landing: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cc_backup_letter')) {
      setShowBanner(true);
    }
  }, []);

  const recoverPdf = () => {
    const backupStr = localStorage.getItem('cc_backup_letter');
    if (backupStr) {
      const backup = JSON.parse(backupStr);
      // CORRECTION : On passe aussi le contenu IA (backup.content) si disponible
      // Sinon le PDF serait regénéré sans les améliorations payantes
      generatePDF(backup.type as LetterType, backup.data as FormData, backup.content);
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <div className="px-4 py-12 md:py-20 max-w-5xl mx-auto relative">
      
      {/* Recovery Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white border-l-4 border-blue-600 p-4 rounded-lg shadow-xl z-50 animate-fade-in border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-900 font-bold text-sm">Document non téléchargé</p>
              <p className="text-slate-500 text-xs mt-1">Vous avez un document payé en attente.</p>
            </div>
            <button 
              onClick={closeBanner} 
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <button 
            onClick={recoverPdf}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors"
          >
            Télécharger le PDF maintenant
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="text-center mb-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          Conforme Loi Française 2025 🇫🇷
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Votre courrier juridique <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            prêt à imprimer
          </span> en 2 minutes.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Zéro avocat. Zéro jargon. Sélectionnez votre besoin, remplissez les champs, 
          nous générons une lettre aux normes légales strictes.
        </p>

        {/* NUDGE POSTAL */}
        <div className="max-w-md mx-auto transform hover:scale-105 transition-transform duration-300 cursor-default">
           <PostalNudge />
        </div>
        
        {/* SOCIAL PROOF - FACES */}
        <div className="flex items-center justify-center gap-4 pt-4 animate-fade-in">
           <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?u=a" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?u=b" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?u=c" alt="User" />
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                +840
              </div>
           </div>
           <div className="text-left">
              <div className="flex gap-0.5 text-yellow-400 text-xs">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-slate-500 font-medium">utilisateurs satisfaits ce mois-ci</p>
           </div>
        </div>
      </div>

      {/* BRAND PRESETS (NEW SEO LINKS) */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px bg-slate-200 w-12"></div>
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Résiliations fréquentes • Accès direct
            </p>
            <div className="h-px bg-slate-200 w-12"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BrandButton name="Basic Fit" slug="resiliation-basic-fit" color="bg-orange-600" popular={true} />
            <BrandButton name="Free Mobile" slug="resiliation-free-mobile" color="bg-red-600" popular={true} />
            <BrandButton name="SFR" slug="resiliation-sfr" color="bg-red-700" />
            <BrandButton name="Canal+" slug="resiliation-canal-plus" color="bg-slate-900" />
            <BrandButton name="Bouygues" slug="resiliation-bouygues" color="bg-blue-600" />
            <BrandButton name="Assurance" slug="resiliation-assurance" color="bg-green-600" />
            <BrandButton name="Orange" slug="resiliation-orange" color="bg-orange-500" />
            <BrandButton name="Fitness Park" slug="resiliation-fitness-park" color="bg-yellow-600" />
        </div>
      </div>

      {/* MAIN CARDS (LINKING TO SEO PAGES) */}
      <div className="grid md:grid-cols-3 gap-6 mb-24">
        <Card 
          to="/form?type=resiliation" // Reste générique pour ceux qui veulent juste le form
          color="blue"
          colorName="blue"
          title="Résilier un Abonnement"
          desc="Salle de sport, forfait mobile, assurance. Invoquez la Loi Châtel et Hamon automatiquement."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
          }
        />
        <Card 
          to="/modele/restitution-caution" // Link to SEO page
          color="emerald"
          colorName="emerald" 
          title="Récupérer une Caution"
          desc="Propriétaire récalcitrant ? Générez une mise en demeure citant la loi de 1989 sous 10 jours."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          }
        />
        <Card 
          to="/modele/contestation-amende" // Link to SEO page
          color="red"
          colorName="red"
          title="Contestation Amende"
          desc="Radar, stationnement (ANTAI). Formulez votre requête en exonération selon le Code de procédure pénale."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          }
        />
      </div>

      {/* WHY US SECTION */}
      <div className="mt-24 mb-16 bg-white rounded-2xl p-10 border border-slate-200 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Pourquoi utiliser CourrierCarré ?</h2>
        <div className="grid md:grid-cols-3 gap-12">
            
            <Feature 
                title="Juridiquement solide"
                desc="Chaque modèle cite les articles de loi exacts pour maximiser vos chances de succès."
                colorClass="bg-blue-100 text-blue-600"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
            />

            <Feature 
                title="Ultra rapide"
                desc="Remplissez le formulaire, prévisualisez, téléchargez. C'est tout."
                colorClass="bg-emerald-100 text-emerald-600"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
            />

            <Feature 
                title="PDF professionnel"
                desc="Format A4, mise en page officielle, prêt à imprimer ou envoyer par courrier."
                colorClass="bg-purple-100 text-purple-600"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
            />

        </div>
      </div>

    </div>
  );
};