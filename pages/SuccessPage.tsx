import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generatePDF } from '../lib/pdfGenerator';
import { FormData, LetterType } from '../types';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    // Check if payment was "made"
    if (!sessionStorage.getItem('cc_paid')) {
      navigate('/');
      return;
    }

    // -- SAFETY NET 2: Persistence --
    const storedData = sessionStorage.getItem('cc_draft');
    const storedType = sessionStorage.getItem('cc_type');
    const storedContent = sessionStorage.getItem('cc_final_content');
    
    if (storedData && storedType) {
      setFormData(JSON.parse(storedData)); // Save to state for usage in UI
      const backup = {
        data: JSON.parse(storedData),
        type: storedType,
        // CRUCIAL: On sauvegarde aussi le contenu généré par l'IA pour le récupérer plus tard
        content: storedContent ? JSON.parse(storedContent) : null,
        date: new Date().toISOString()
      };
      localStorage.setItem('cc_backup_letter', JSON.stringify(backup));
    }

  }, [navigate]);

  const handleDownload = () => {
    const storedData = sessionStorage.getItem('cc_draft');
    const storedType = sessionStorage.getItem('cc_type') as LetterType;
    // Récupérer le contenu FINAL (celui potentiellement modifié par l'IA)
    const storedContent = sessionStorage.getItem('cc_final_content');

    if (storedData) {
      if (storedContent) {
          // Si on a le contenu intelligent, on l'utilise
          generatePDF(storedType, JSON.parse(storedData), JSON.parse(storedContent));
      } else {
          // Sinon on utilise le générateur standard
          generatePDF(storedType, JSON.parse(storedData));
      }
    }
  };

  const handleEdit = () => {
    // Correction: On récupère le type pour ne pas perdre le contexte (Caution vs Resiliation)
    const storedType = sessionStorage.getItem('cc_type') || 'resiliation';
    navigate(`/form?type=${storedType}`);
  };

  // Construct WhatsApp Message
  const getWhatsAppLink = () => {
    const recipient = formData?.recipientName || "mon abonnement";
    // Message optimisé pour le "Dark Social" (recommandation pote à pote)
    const text = `Je viens enfin de réussir à résilier ${recipient} en 2 minutes sans me prendre la tête. Si tu as besoin, j'ai utilisé ça : https://courriercarre.fr`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start px-4 pt-10 pb-20 bg-slate-50">
      
      {/* HEADER SUCCESS */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Votre courrier est prêt.</h1>
        <p className="text-slate-600">Le dossier a été généré avec succès.</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 w-full max-w-lg">
        <button 
          onClick={handleDownload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-transform hover:scale-105 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Télécharger PDF
        </button>

        <button 
          onClick={handleEdit}
          className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl shadow-md border border-slate-200 transition-transform hover:scale-105 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Modifier
        </button>
      </div>

      {/* SECTION WHATSAPP / VIRALITÉ */}
      <div className="w-full max-w-lg mb-16 relative group">
         <div className="absolute -inset-0.5 bg-green-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
         <div className="relative bg-white border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <h3 className="text-slate-900 font-bold text-lg mb-2 flex items-center gap-2">
                Soulagé(e) ? 
                <span className="text-2xl">😅</span>
            </h3>
            <p className="text-slate-500 text-sm mb-5">
                On a tous un ami qui repousse ses papiers. Envoyez-lui la solution en un clic.
            </p>
            
            <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Prévenir un ami sur WhatsApp
            </a>
         </div>
      </div>

      {/* STEPS / MODE D'EMPLOI */}
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs text-white">i</span>
          Prochaines étapes (Mode d'emploi)
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-bold text-slate-300">1</div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Imprimez & Signez</h3>
            <p className="text-slate-600 text-sm">
              Imprimez le document en <strong>2 exemplaires</strong> (un pour l'envoi, un pour vos archives). Signez manuellement en bas à droite à l'encre noire ou bleue.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-bold text-slate-300">2</div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><line x1="16" y1="8" x2="2" y2="8"></line><line x1="16" y1="16" x2="22" y2="16"></line><line x1="10" y1="3" x2="10" y2="16"></line></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Envoyez en Recommandé</h3>
            <p className="text-slate-600 text-sm">
              Rendez-vous à La Poste et envoyez le courrier en <strong>Recommandé avec Accusé de Réception (LRAR)</strong>. C'est la seule preuve juridique valable.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-bold text-slate-300">3</div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Conservez les preuves</h3>
            <p className="text-slate-600 text-sm">
              Agrafez le bordereau de dépôt (preuve d'envoi) avec votre copie de la lettre. Lorsque vous recevrez l'Accusé de Réception (avis jaune), conservez-le précieusement.
            </p>
          </div>
        </div>
      </div>

      <Link 
        to="/"
        className="mt-12 text-slate-400 hover:text-blue-600 text-sm underline underline-offset-4 cursor-pointer"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};