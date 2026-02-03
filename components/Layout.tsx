import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [hasPaid, setHasPaid] = useState(false);

  // Vérifier le statut de paiement à chaque changement de page
  useEffect(() => {
    const paid = sessionStorage.getItem('cc_paid') === 'true';
    setHasPaid(paid);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Courrier<span className="text-blue-600">Carré</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
             {!isHome && (
               <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors hidden md:block">Accueil</Link>
             )}
             
             {/* Bouton de récupération visible si payé */}
             {hasPaid && (
                <Link 
                  to="/success" 
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors animate-fade-in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span className="font-bold">Mon Document</span>
                </Link>
             )}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <div className="mb-4 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Fake logos for trust */}
             <span className="font-serif italic font-bold text-lg">Le Figaro</span>
             <span className="font-serif italic font-bold text-lg">Le Monde</span>
             <span className="font-serif italic font-bold text-lg">BFM Business</span>
          </div>
          <p className="mb-2">© {new Date().getFullYear()} CourrierCarré - Générateur Juridique.</p>
          <div className="flex justify-center gap-4 text-xs">
            <Link to="/cgv" className="hover:text-blue-600 transition-colors underline">Conditions Générales de Vente</Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Mentions Légales</span>
          </div>
          <p className="mt-4 text-slate-400 text-xs">Propulsé par la Loi Française 🇫🇷, sécurisé par Stripe.</p>
        </div>
      </footer>
    </div>
  );
};