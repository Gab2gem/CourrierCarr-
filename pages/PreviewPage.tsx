import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { FormData, LetterType, TemplateResult } from '../types';
import { generateLetterContent } from '../lib/legalEngine';
import { PostalNudge } from '../components/ui/PostalNudge';
import { api } from '../lib/api';

// COMPONENT: LE MACARON DE CONFIANCE (Version 2026 - Balance de Justice - RESPONSIVE)
const CertificationBadge = () => (
  <div className="absolute top-2 right-2 md:top-8 md:right-8 z-20 pointer-events-none select-none">
    {/* Taille réduite sur mobile (w-20) vs Desktop (w-28) */}
    <div className="relative w-20 h-20 md:w-28 md:h-28">
      
      {/* 1. TEXTE CIRCULAIRE ROTATIF */}
      <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
         <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
           <defs>
             <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
           </defs>
           <text fontSize="10.5" fontWeight="bold" fill="#1e293b" letterSpacing="2.5">
             <textPath href="#circlePath" startOffset="0%">
               • CERTIFIÉ CONFORME • LOI FRANÇAISE
             </textPath>
           </text>
         </svg>
      </div>

      {/* 2. FOND CENTRAL (Style Tampon) */}
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-[65%] h-[65%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner border border-slate-200 relative overflow-hidden">
            
            {/* ICONE BALANCE (Scales of Justice) */}
            <div className="text-blue-900 mb-0.5 drop-shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="M7 21h10"/>
                  <path d="M12 3v18"/>
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
               </svg>
            </div>

            {/* Touche Tricolore (Bleu Blanc Rouge) sous le symbole */}
            <div className="flex gap-1 mt-1 opacity-80">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-600"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-300"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-red-600"></div>
            </div>

         </div>
      </div>

      {/* 3. RUBAN ANNÉE */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
         <div className="bg-blue-900 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 rounded-full shadow-sm border border-blue-700 tracking-widest font-mono">
             2026
         </div>
      </div>
    </div>
  </div>
);

export const PreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FormData | null>(null);
  const [type, setType] = useState<LetterType>('resiliation');
  const [content, setContent] = useState<TemplateResult | null>(null);
  const [loading, setLoading] = useState(false); // Payment loading
  const [analyzing, setAnalyzing] = useState(false); // AI Analysis loading
  const [isPaid, setIsPaid] = useState(false);
  
  // PROMO CODE STATE
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [finalPrice, setFinalPrice] = useState(3.90);

  // LEGAL CONSENT STATE
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [shake, setShake] = useState(false); // New state for animation
  
  // Ref to ensure we only run AI once per session/mount
  const analysisRan = useRef(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('cc_draft');
    const storedType = sessionStorage.getItem('cc_type') as LetterType;
    const paidStatus = sessionStorage.getItem('cc_paid') === 'true';
    
    setIsPaid(paidStatus);

    if (!storedData) {
      navigate('/');
      return;
    }

    const parsedData = JSON.parse(storedData);
    setData(parsedData);
    const currentType = storedType || 'resiliation';
    setType(currentType);
    
    // Initial generation (Standard template)
    const initialContent = generateLetterContent(currentType, parsedData);
    setContent(initialContent);
    // SAUVEGARDE INITIALE (Au cas où l'IA ne tourne pas)
    sessionStorage.setItem('cc_final_content', JSON.stringify(initialContent));

    // AI ENHANCEMENT LOGIC
    // On lance l'IA pour 'resiliation', 'caution' ET 'amende'
    const supportedTypesForAI = ['resiliation', 'caution', 'amende'];
    
    if (supportedTypesForAI.includes(currentType) && !analysisRan.current) {
        analysisRan.current = true;
        
        // TIMEOUT SAFETY: Si l'IA met plus de 5 secondes, on annule le loading pour afficher le bouton Payer
        const safetyTimeout = setTimeout(() => {
             setAnalyzing(false);
        }, 5000);

        runLegalSafetyCheck(currentType, parsedData, initialContent).then(() => {
             clearTimeout(safetyTimeout);
        });
    }

  }, [navigate]);

  const runLegalSafetyCheck = async (letterType: LetterType, formData: FormData, originalContent: TemplateResult) => {
    setAnalyzing(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    try {
        let systemInstruction = "";
        let prompt = "";

        // --- SCÉNARIO 1 : RÉSILIATION ---
        if (letterType === 'resiliation') {
            const rawUserInput = formData.customDetails || "";
            const mainReason = formData.reason || "";

            systemInstruction = `Tu es un Expert Juridique spécialisé en Droit de la Consommation (Loi Châtel/Hamon).
            TA MISSION : Rédiger le corps d'une lettre de résiliation.
            - Ton : Formel, Administratif, Irréfutable.
            - Si motif légitime (déménagement, décès) : Sois factuel.
            - Si litige : Sois offensif.
            
            FORMAT JSON ATTENDU :
            {
              "legalArgument": "Paragraphe factuel reformulé (Ex: 'Compte tenu de mon déménagement...')",
              "lawParagraph": "Article de loi applicable",
              "legalReference": "Référence courte"
            }`;

            prompt = `Motif : "${mainReason}". Détails utilisateur : "${rawUserInput}". Génère le JSON.`;
        } 
        
        // --- SCÉNARIO 2 : CAUTION (DEPOT DE GARANTIE) ---
        else if (letterType === 'caution') {
            const isConforme = formData.isEDLConforme === 'oui';
            const days = parseInt(formData.daysSinceDeparture || '0');
            const userDetails = formData.customDetails || "Aucun détail supplémentaire.";
            
            systemInstruction = `Tu es un Avocat spécialisé en Droit Immobilier (Loi du 6 juillet 1989).
            TA MISSION : Rédiger une mise en demeure pour restitution de dépôt de garantie.
            
            RÈGLES JURIDIQUES STRICTES :
            1. Si l'Etat des Lieux de sortie (EDL) est CONFORME à l'entrée : Le délai de restitution est de 1 mois.
            2. Si l'EDL est NON-CONFORME : Le délai est de 2 mois.
            3. Si le délai est dépassé : Tu DOIS exiger la pénalité de 10% du loyer par mois de retard (Art 22).
            4. Si le propriétaire retient de l'argent : Il doit fournir des FACTURES, pas de simples devis. Tu dois contester les retenues abusives basées sur les "détails utilisateur".

            TON : Menaçant, Procédurier, Ferme. Tu menaces de saisir la Commission Départementale de Conciliation.

            FORMAT JSON ATTENDU :
            {
              "legalArgument": "Analyse de la situation (retard constaté + contestation des retenues basée sur les dires du client reformulés juridiquement).",
              "lawParagraph": "L'article 22 de la loi du 6 juillet 1989 complet adapté au cas (retard ou retenue injustifiée).",
              "legalReference": "Loi n° 89-462 du 6 juillet 1989, Article 22"
            }`;

            prompt = `CONTEXTE :
            - EDL Conforme à l'entrée ? : ${isConforme ? 'OUI' : 'NON'}.
            - Jours écoulés depuis remise des clés : ${days} jours.
            - Plaintes du locataire (Détails) : "${userDetails}".

            Génère le JSON de l'argumentaire juridique.`;
        }

        // --- SCÉNARIO 3 : AMENDE (CONTESTATION) ---
        else if (letterType === 'amende') {
            const reason = formData.reason || "Non spécifié";
            const details = formData.customDetails || "Aucun détail.";
            const plate = formData.licensePlate || "XX-000-XX";

            systemInstruction = `Tu es un Avocat spécialisé en Droit Routier et Code de la Route.
            TA MISSION : Rédiger une requête en exonération pour contester une contravention auprès de l'Officier du Ministère Public (OMP).

            STRATÉGIE JURIDIQUE :
            1. Si "Vol/Cession" : Argumente sur la preuve (certificat cession, récépissé plainte). Demande le classement sans suite immédiat.
            2. Si "Autre conducteur" (Prêt) : Si l'utilisateur donne un nom dans les détails, formule une désignation. Si les détails sont vagues ou nient être le conducteur sans désigner : Rappelle l'article L.121-3 du Code de la Route (le titulaire est redevable pécuniairement mais pas pénalement -> pas de perte de points). C'est CRUCIAL.
            3. Si "Réalité de l'infraction" : Conteste la force probante du PV (Article 537 du CPP). Demande la communication du cliché radar s'il s'agit d'un excès de vitesse.

            TON : Extrêmement formel, froid, respectueux mais procédurier.

            FORMAT JSON ATTENDU :
            {
              "legalArgument": "Exposé des faits reformulé juridiquement (Ex: 'Il appert que mon véhicule avait été cédé à la date des faits...'). Mentionne les pièces jointes si nécessaire.",
              "lawParagraph": "L'article de loi précis qui protège le conducteur (Ex: L.121-3, Article 537 CPP, ou 529-2 CPP).",
              "legalReference": "Code de Procédure Pénale & Code de la Route"
            }`;

            prompt = `MOTIF CONTESTATION : "${reason}".
            PLAQUE : ${plate}.
            DÉTAILS UTILISATEUR : "${details}".
            
            Génère l'argumentaire juridique.`;
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                systemInstruction: systemInstruction
            }
        });

        const finalContent = JSON.parse(response.text || "{}");

        if (finalContent.legalArgument && finalContent.lawParagraph) {
            setContent(prev => {
                if (!prev) return null;
                
                let newBody: string[] = [];

                if (letterType === 'resiliation') {
                    newBody = [
                        prev.body[0], // Madame, Monsieur
                        prev.body[1], // Intro standard
                        finalContent.legalArgument,
                        `FONDEMENT LÉGAL :`,
                        finalContent.lawParagraph
                    ];
                    // Add standard conclusion
                    const demandIndex = prev.body.findIndex(line => line.includes('CONCLUSIONS'));
                    if (demandIndex !== -1) newBody.push(...prev.body.slice(demandIndex));

                } else if (letterType === 'caution') {
                    newBody = [
                        prev.body[0], // Madame, Monsieur
                        prev.body[1], // J'ai occupé...
                        prev.body[2], // Le bail a pris fin...
                    ];

                    newBody.push(finalContent.legalArgument);
                    newBody.push(`RAPPEL À LA LOI :`);
                    newBody.push(finalContent.lawParagraph);
                    
                    const demandIndex = prev.body.findIndex(line => line.includes('CONCLUSIONS'));
                    if (demandIndex !== -1) newBody.push(...prev.body.slice(demandIndex));
                    else {
                         newBody.push(
                            `CONCLUSIONS ET DEMANDES :`,
                            `Je vous mets en demeure de procéder au virement immédiat des sommes dues.`,
                            `À défaut, je saisirai la juridiction compétente.`
                         );
                    }
                } else if (letterType === 'amende') {
                    newBody = [
                        prev.body[0], // Monsieur l'OMP
                        prev.body[1], // Je forme requete...
                        // Pas d'intro générique ici, on remplace direct par l'argumentaire IA qui est plus précis
                        finalContent.legalArgument,
                        `ARGUMENTATION JURIDIQUE :`,
                        finalContent.lawParagraph
                    ];

                    // On garde la conclusion standard (Demande de classement ou comparution)
                    const conclIndex = prev.body.findIndex(line => line.includes('CONCLUSIONS'));
                    if (conclIndex !== -1) newBody.push(...prev.body.slice(conclIndex));
                } else {
                    return prev;
                }

                const updatedContent = {
                    ...prev,
                    body: newBody,
                    legalReferences: finalContent.legalReference || prev.legalReferences
                };

                // Sauvegarder la version IA
                sessionStorage.setItem('cc_final_content', JSON.stringify(updatedContent));

                return updatedContent;
            });
        }

    } catch (e) {
        console.error("AI Legal Safety Check failed", e);
    } finally {
        setAnalyzing(false);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME') {
        setFinalPrice(1.95);
        setPromoMessage({ type: 'success', text: '-50% appliqués !' });
    } else if (code === 'GRATUIT') {
        setFinalPrice(0);
        setPromoMessage({ type: 'success', text: 'Document offert !' });
    } else {
        setPromoMessage({ type: 'error', text: 'Code expiré ou invalide.' });
        setFinalPrice(3.90);
    }
  };

  const handlePayment = async () => {
    // UX CHECK: Si pas coché, on "shake" la checkbox pour indiquer l'erreur sans bloquer visuellement
    if (!cgvAccepted) {
        setShake(true);
        // Reset shake after animation
        setTimeout(() => setShake(false), 500);
        return;
    }

    setLoading(true);
    
    // Cas spécial: Gratuit (Code promo)
    if (finalPrice === 0) {
        setTimeout(() => {
            sessionStorage.setItem('cc_paid', 'true');
            setIsPaid(true);
            navigate('/success');
        }, 1000);
        return;
    }

    // Cas normal: Paiement Stripe
    const url = await api.createCheckoutSession();
    if (url) {
        // Redirection vers Stripe
        window.location.href = url;
    } else {
        setLoading(false);
    }
  };

  const handleUpdate = () => {
    navigate('/success');
  }

  if (!data || !content) return null;

  return (
    <div className="min-h-screen py-6 md:py-10 px-2 md:px-4 flex flex-col items-center bg-slate-50">
       <Link to={`/form?type=${type}`} className="self-start md:ml-10 text-slate-500 hover:text-blue-600 text-sm mb-4 md:mb-6 flex items-center gap-2 pl-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Modifier les informations
      </Link>

      {/* PAPER CONTAINER: Responsive padding (p-5 on mobile vs p-[15mm] desktop) */}
      <div className="relative w-full max-w-[210mm] bg-white text-black shadow-2xl rounded-sm p-5 md:p-[15mm] lg:p-[20mm] min-h-[500px] md:min-h-[297mm] overflow-hidden border border-slate-200">
        
        {/* LE MACARON "CERTIFIÉ" - Visible même quand c'est flou pour rassurer */}
        <CertificationBadge />

        {/* Floating Overlay (Payment Modal) */}
        <div className={`absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[3px] transition-all duration-500 ${isPaid ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 text-center w-[95%] max-w-sm mx-auto transform transition-all hover:scale-[1.02]" style={{ pointerEvents: isPaid ? 'none' : 'auto' }}>
            
            {analyzing ? (
                <div className="py-6 px-2">
                     <div className="w-16 h-16 md:w-20 md:h-20 relative mx-auto mb-4">
                        {/* SARAH AVATAR LOADING - Using specific image 32 to ensure adult professional */}
                        <img src="https://i.pravatar.cc/150?img=32" alt="Sarah" className="w-full h-full rounded-full border-4 border-white shadow-lg relative z-10 object-cover" />
                        <div className="absolute -inset-1 rounded-full border-2 border-blue-600 animate-spin border-t-transparent z-0"></div>
                     </div>
                     <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 font-serif">Sarah vérifie votre dossier...</h3>
                     <p className="text-slate-500 text-xs md:text-sm animate-pulse">Recherche des articles de loi...</p>
                </div>
            ) : !isPaid ? (
              <>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Débloquer le document</h3>
                <p className="text-slate-500 mb-4 text-sm leading-snug">Obtenez votre PDF haute résolution, prêt à imprimer et conforme à la loi.</p>
                
                {/* URGENCY NUDGE */}
                <div className="mb-4 text-left">
                     <PostalNudge className="text-xs py-2" />
                </div>

                {/* PROMO CODE SECTION */}
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Code Promo ?" 
                            className="bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 w-full focus:ring-1 focus:ring-blue-500 outline-none uppercase shadow-sm"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <button 
                            onClick={handleApplyPromo}
                            className="bg-slate-800 hover:bg-slate-700 text-xs text-white px-3 py-2 rounded font-medium transition-colors"
                        >
                            OK
                        </button>
                    </div>
                    {promoMessage && (
                        <p className={`text-xs mt-2 text-left font-medium ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {promoMessage.text}
                        </p>
                    )}
                </div>

                {/* MINIMALIST LEGAL CONSENT (ABOVE BUTTON) */}
                {/* Shake animation class added if error */}
                <div className={`mb-3 text-left transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                    <label className="flex items-start gap-2 cursor-pointer group">
                        <div className="relative flex items-center pt-0.5">
                            <input 
                                type="checkbox" 
                                className={`w-4 h-4 rounded border-slate-300 cursor-pointer transition-colors focus:ring-offset-0 focus:ring-0 ${shake ? 'border-red-500 bg-red-50' : 'text-blue-600 focus:ring-blue-500'}`}
                                checked={cgvAccepted}
                                onChange={(e) => setCgvAccepted(e.target.checked)}
                            />
                        </div>
                        <span className={`text-[10px] leading-tight select-none transition-colors ${shake ? 'text-red-500 font-medium' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            Je valide les <Link to="/cgv" target="_blank" className="underline decoration-slate-300 hover:text-blue-600">CGV</Link> et demande l'accès immédiat au document (renonce au délai de rétractation).
                        </span>
                    </label>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading} // On ne disable PLUS si cgvAccepted est false, on gère le click
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 touch-manipulation mb-4 transition-all"
                >
                  {loading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <>
                      <span>Payer & Télécharger</span>
                      <span className="bg-blue-800 text-xs py-0.5 px-2 rounded text-blue-100 font-mono">
                        {finalPrice === 0 ? "GRATUIT" : `${finalPrice.toFixed(2)} €`}
                      </span>
                    </>
                  )}
                </button>

                {/* SOCIAL PROOF MICRO-TEXT */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                   <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full bg-slate-200 border border-white"></div>
                      <div className="w-4 h-4 rounded-full bg-slate-300 border border-white"></div>
                      <div className="w-4 h-4 rounded-full bg-slate-400 border border-white"></div>
                   </div>
                   <p>Déjà 840 utilisateurs satisfaits ce mois-ci</p>
                </div>

                <p className="mt-2 text-[10px] text-slate-300 flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Paiement sécurisé via Stripe
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Document Débloqué</h3>
                <p className="text-slate-500 mb-6 text-sm">Votre document a été mis à jour avec vos nouvelles informations.</p>
                
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Valider & Télécharger</span>
                </button>
              </>
            )}

          </div>
        </div>

        {/* The Letter Content */}
        {/* If paid, remove the blur */}
        <div className="font-serif text-[10pt] md:text-[11pt] leading-relaxed relative text-black">
          
          {/* Header */}
          <div className="mb-6 md:mb-8 text-xs md:text-sm">
            <div className="mb-4">
              <p className="font-bold">{data.firstName} {data.lastName}</p>
              <p>{data.address}</p>
              <p>{data.postalCode} {data.city}</p>
              <p>{data.email}</p>
              {data.phone && <p>{data.phone}</p>}
            </div>

            <div className="text-right mt-6 md:mt-8 pl-10 md:pl-0">
              <p className="font-bold">{data.recipientName}</p>
              <p>{data.recipientAddress}</p>
              <p>{data.recipientPostalCode} {data.recipientCity}</p>
            </div>

            <div className="text-right mt-6 md:mt-8">
              <p>Fait à {data.city}, le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="mb-4 md:mb-6 font-bold uppercase tracking-wide border-b border-black pb-1 inline-block text-xs md:text-base">
            {content.subject}
          </div>

          <div className="mb-4 md:mb-6 text-[10px] md:text-xs text-gray-800">
            Réf : {content.legalReferences}
          </div>

          {/* Body */}
          <div className={`space-y-3 md:space-y-4 ${!isPaid ? 'filter blur-[5px] md:blur-[6px] select-none opacity-60' : ''}`}>
            {content.body.map((paragraph, index) => (
              <p key={index} className="text-justify">{paragraph}</p>
            ))}
            
            <div className="mt-10 md:mt-16 text-right mr-4 md:mr-10 font-bold">
              Signature
            </div>
          </div>

        </div>
      </div>

      {/* SECTION PREUVE PAR L'EXEMPLE (REASSURANCE PAIEMENT) */}
      {!isPaid && (
        <div className="mt-16 md:mt-20 w-full max-w-4xl px-2 md:px-4 mb-10">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 text-center mb-8 md:mb-10 flex flex-col items-center">
                <span>Pourquoi ce document vaut 3.90€ ?</span>
                <span className="text-xs md:text-sm font-normal text-slate-500 mt-2">Évitez le rejet de votre dossier.</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                {/* Colonne "Avant / Gratuit" */}
                <div className="bg-slate-100 rounded-2xl p-5 md:p-6 border border-slate-200 flex flex-col opacity-80 scale-95">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide">
                            Fait maison
                        </span>
                        <span className="text-[10px] text-slate-500">Risqué</span>
                    </div>

                    <div className="bg-white p-3 md:p-4 rounded shadow-sm text-slate-800 font-serif italic text-xs leading-loose rotate-1 mb-6 flex-grow relative grayscale border border-slate-100">
                        <div className="absolute -top-3 -right-3 text-2xl">👎</div>
                        "Bonjour, je veux arrêter mon abonnement. Merci de faire le nécessaire..."
                    </div>

                    <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex items-center gap-2">
                            <span className="text-red-500">✕</span>
                            <span>Pas de référence légale (Loi Châtel)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500">✕</span>
                            <span>Motif juridique mal formulé</span>
                        </li>
                    </ul>
                </div>

                {/* Colonne "Après / CourrierCarré" */}
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400 to-blue-200 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-white rounded-2xl p-5 md:p-6 border border-blue-100 h-full flex flex-col shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                                Votre Document
                            </span>
                            <span className="text-[10px] text-blue-400">Certifié</span>
                        </div>

                        <div className="bg-slate-50 p-3 md:p-4 rounded shadow-md text-slate-900 text-[10px] font-serif leading-tight mb-4 relative overflow-hidden flex-grow border border-slate-100">
                             {/* PETIT RAPPEL DU BADGE DANS L'EXEMPLE AUSSI */}
                             <div className="absolute top-0 right-0 w-8 h-8 bg-blue-800 shadow-md flex items-center justify-center rounded-bl-lg text-white z-10">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <p className="font-bold mb-2">Objet : Mise en demeure</p>
                            <p className="mb-2 text-justify">
                                Notifie la résiliation <span className="bg-blue-100 text-blue-800 px-0.5 font-bold">conformément à l'article L.215-1</span> du Code de la consommation.
                            </p>
                            <p className="font-bold border-l-2 border-black pl-2">
                                Cessation des prélèvements sous 10 jours.
                            </p>
                        </div>

                        <div className="mt-auto text-center">
                            <p className="text-xs text-blue-600 font-bold mb-1">C'est ce document que vous allez télécharger.</p>
                            <p className="text-[10px] text-slate-500">Vérifié par notre algorithme juridique.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};