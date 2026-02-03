import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Input, TextArea, Select, FileUpload } from '../components/ui/Input';
import { LetterType, FormData } from '../types';

const INITIAL_DATA: FormData = {
  firstName: '', lastName: '', address: '', postalCode: '', city: '', email: '', phone: '',
  recipientName: '', recipientAddress: '', recipientPostalCode: '', recipientCity: '',
  reason: '', contractNumber: '', subscriptionDate: '', 
  rentedAddress: '', moveInDate: '', moveOutDate: '', depositAmount: '', isEDLConforme: '', daysSinceDeparture: '',
  fineNumber: '', fineDate: '', licensePlate: '', tribunalName: '', tribunalAddress: '',
  attachmentNames: [],
  customDetails: ''
};

// Base de données des adresses de résiliation (Presets)
const BRAND_PRESETS: Record<string, Partial<FormData>> = {
  'basic-fit': {
    recipientName: 'Basic-Fit Service Clientèle',
    recipientAddress: 'Postbus 3124',
    recipientPostalCode: '2130 KC',
    recipientCity: 'Hoofddorp (PAYS-BAS)',
  },
  'free': {
    recipientName: 'Free Mobile - Service Résiliation',
    recipientAddress: '75371 Paris Cedex 08',
    recipientPostalCode: '75371',
    recipientCity: 'Paris Cedex 08',
  },
  'sfr': {
    recipientName: 'SFR Service Résiliation',
    recipientAddress: 'TSA 13920',
    recipientPostalCode: '62978',
    recipientCity: 'Arras Cedex 9',
  },
  'bouygues': {
    recipientName: 'Bouygues Telecom - Service Clients',
    recipientAddress: 'TSA 59013',
    recipientPostalCode: '60643',
    recipientCity: 'Chantilly Cedex',
  },
  'orange': {
    recipientName: 'Orange - Service Clients Mobile',
    recipientAddress: '33732 Bordeaux Cedex 9',
    recipientPostalCode: '33732',
    recipientCity: 'Bordeaux Cedex 9',
  },
  'canal': {
    recipientName: 'Canal+ / CanalSat',
    recipientAddress: 'Service Résiliation - TSA 86712',
    recipientPostalCode: '95905',
    recipientCity: 'Cergy Pontoise Cedex 9',
  },
  'fitness-park': {
    recipientName: 'Fitness Park - Service Adhérents',
    recipientAddress: 'Consultez votre contrat pour l\'adresse du club',
    recipientPostalCode: '',
    recipientCity: '',
  },
  'assurance': {
    recipientName: 'Service Résiliation Assurance',
    recipientAddress: '',
    recipientPostalCode: '',
    recipientCity: '',
  }
};

interface FormPageProps {
    initialType?: LetterType;
    initialPreset?: string;
    embedded?: boolean;
}

export const FormPage: React.FC<FormPageProps> = ({ initialType, initialPreset, embedded = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  
  const type = initialType || (searchParams.get('type') as LetterType) || 'resiliation';
  const presetKey = initialPreset || searchParams.get('preset');
  
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorStep, setErrorStep] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('cc_draft');
    
    // CAS SPECIAL AMENDE : On pré-remplit l'OMP par défaut si c'est vide
    if (type === 'amende' && !saved) {
         setFormData(prev => ({
             ...prev,
             recipientName: "Monsieur l'Officier du Ministère Public"
         }));
    }
    
    if (presetKey && BRAND_PRESETS[presetKey]) {
        let shouldReset = true;
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.recipientName === BRAND_PRESETS[presetKey].recipientName) {
                shouldReset = false;
            }
        }

        if (shouldReset) {
            setFormData({
                ...INITIAL_DATA,
                ...BRAND_PRESETS[presetKey]
            });
            sessionStorage.removeItem('cc_paid');
            sessionStorage.removeItem('cc_final_content');
            sessionStorage.removeItem('cc_draft');
        } else {
            setFormData(JSON.parse(saved!));
        }
    } else if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, [presetKey, type]);

  useEffect(() => {
    if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    if (errorStep) setErrorStep(null);
  };

  const handleFilesSelected = (fileNames: string[]) => {
    setFormData(prev => ({ ...prev, attachmentNames: fileNames }));
  };

  const validateCurrentStep = () => {
      let isValid = true;
      let missingField = '';

      if (currentStep === 1) {
          if (!formData.firstName) missingField = 'Prénom';
          else if (!formData.lastName) missingField = 'Nom';
          else if (!formData.address) missingField = 'Adresse';
          else if (!formData.postalCode) missingField = 'Code Postal';
          else if (!formData.city) missingField = 'Ville';
          else if (!formData.email || !formData.email.includes('@')) missingField = 'Email valide';
      }
      else if (currentStep === 2) {
          if (!formData.recipientName) missingField = 'Nom du destinataire';
          else if (!formData.recipientAddress) missingField = 'Adresse destinataire';
          else if (!formData.recipientPostalCode && presetKey !== 'fitness-park' && presetKey !== 'assurance') missingField = 'Code Postal destinataire';
          else if (!formData.recipientCity && presetKey !== 'fitness-park' && presetKey !== 'assurance') missingField = 'Ville destinataire';
      }
      else if (currentStep === 3) {
          if (type === 'resiliation') {
              if (!formData.contractNumber) missingField = 'Numéro de contrat';
              else if (!formData.reason) missingField = 'Motif de résiliation';
          } else if (type === 'caution') {
              if (!formData.rentedAddress) missingField = 'Adresse logement';
              else if (!formData.moveInDate) missingField = "Date d'entrée";
              else if (!formData.moveOutDate) missingField = "Date de sortie";
              else if (!formData.depositAmount) missingField = "Montant caution";
              else if (!formData.daysSinceDeparture) missingField = "Jours écoulés";
              else if (!formData.isEDLConforme) missingField = "État des lieux";
          } else if (type === 'amende') {
              if (!formData.fineNumber) missingField = "Numéro d'avis";
              else if (!formData.fineDate) missingField = "Date d'avis";
              else if (!formData.licensePlate) missingField = "Immatriculation";
              else if (!formData.reason) missingField = "Motif contestation";
          }
      }

      if (missingField) {
          setErrorStep(`Veuillez remplir : ${missingField}`);
          isValid = false;
      }

      return isValid;
  };

  const handleNext = () => {
      if (validateCurrentStep()) {
          setCurrentStep(prev => prev + 1);
      }
  };

  const handlePrev = () => {
      setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
        sessionStorage.setItem('cc_draft', JSON.stringify(formData));
        sessionStorage.setItem('cc_type', type);
        navigate('/preview');
    }
  };

  const fillAntaiAddress = () => {
    setFormData(prev => ({
        ...prev,
        recipientName: "Monsieur l'Officier du Ministère Public",
        recipientAddress: "CS 41101",
        recipientPostalCode: "35911",
        recipientCity: "Rennes Cedex 9"
    }));
  };

  const getTitle = () => {
    switch (type) {
      case 'resiliation': return 'Résiliation de Contrat';
      case 'caution': return 'Restitution de Caution';
      case 'amende': return 'Contestation Contravention';
      default: return 'Nouveau Courrier';
    }
  };

  const SarahTip = () => (
     <div className="flex items-start gap-3 bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100 mt-0 shadow-sm animate-fade-in">
        <div className="relative flex-shrink-0">
           <img src="https://i.pravatar.cc/150?img=32" alt="Sarah" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md object-cover" />
           <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border border-white"></div>
        </div>
        <div>
          <p className="font-bold text-blue-900 text-sm mb-0.5">Le conseil de Sarah <span className="text-blue-400 font-normal text-xs ml-1">(Juriste)</span></p>
          <p className="text-slate-600 text-xs leading-relaxed">
            "Détaillez votre situation ci-dessous. C'est ce qui me permettra d'argumenter juridiquement pour vous."
          </p>
        </div>
     </div>
  );

  return (
    <div className={`max-w-2xl mx-auto px-4 ${embedded ? 'py-0' : 'py-6 md:py-10'} min-h-screen flex flex-col`} ref={topRef}>
      
      {!embedded && (
          <div className="flex items-center justify-between mb-6">
              <Link to="/" className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Accueil
              </Link>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                 {type.toUpperCase()}
              </div>
          </div>
      )}

      <div className="mb-6">
         <h1 className="text-2xl font-bold text-slate-900 mb-2">{getTitle()}</h1>
         <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
         </div>
         <p className="text-xs font-medium text-slate-500 text-right">Étape {currentStep} sur 4</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card flex-grow flex flex-col relative overflow-hidden">
        
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-700"></div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8 flex flex-col gap-6 flex-grow">
          
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">1</span>
                    Qui êtes-vous ? (Expéditeur)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Prénom *" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" />
                    <Input label="Nom *" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                </div>
                
                <Input label="Votre adresse postale *" name="address" value={formData.address} onChange={handleChange} placeholder="12 rue de la Paix" />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Code Postal *" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="75000" />
                    <Input label="Ville *" name="city" value={formData.city} onChange={handleChange} placeholder="Paris" />
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input type="email" label="Email *" name="email" value={formData.email} onChange={handleChange} placeholder="jean@email.com" />
                        <Input type="tel" label="Téléphone" name="phone" value={formData.phone} onChange={handleChange} placeholder="06 12..." />
                    </div>
                </div>
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-5 animate-fade-in">
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">2</span>
                        À qui écrivez-vous ?
                    </h2>
                    {presetKey && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-mono">
                            PRESET: {presetKey.toUpperCase()}
                        </span>
                    )}
                </div>

                {type === 'amende' && (
                    <button 
                        onClick={(e) => { e.preventDefault(); fillAntaiAddress(); }}
                        className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg border border-blue-200 flex items-center gap-3 transition-all"
                    >
                        <span className="text-xl">⚡️</span>
                        <div className="text-sm">
                            <span className="font-bold block">Remplissage automatique Radar</span>
                            <span className="opacity-80 text-xs">Utiliser l'adresse officielle de Rennes (ANTAI)</span>
                        </div>
                    </button>
                )}

                {presetKey && (
                     <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div className="text-xs text-blue-800">
                             L'adresse de <strong>{BRAND_PRESETS[presetKey]?.recipientName}</strong> a été pré-remplie. Vérifiez qu'elle correspond à votre service (Box/Mobile).
                        </div>
                     </div>
                )}

                <Input 
                    label={type === 'caution' ? "Nom du Propriétaire *" : "Nom de l'Organisme *"} 
                    name="recipientName" 
                    value={formData.recipientName} 
                    onChange={handleChange} 
                />
                
                <Input label="Adresse *" name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Code Postal" name="recipientPostalCode" value={formData.recipientPostalCode} onChange={handleChange} />
                    <Input label="Ville" name="recipientCity" value={formData.recipientCity} onChange={handleChange} />
                </div>
             </div>
          )}

          {currentStep === 3 && (
             <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">3</span>
                    Détails du contrat & Faits
                </h2>

                {type === 'resiliation' && (
                    <>
                        <Input label="Numéro de contrat / client *" name="contractNumber" value={formData.contractNumber} onChange={handleChange} placeholder="ABC-123456" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input type="date" label="Date de souscription" name="subscriptionDate" value={formData.subscriptionDate} onChange={handleChange} />
                            <Select 
                                label="Motif de résiliation *" 
                                name="reason" 
                                value={formData.reason} 
                                onChange={handleChange} 
                                options={[
                                    { value: 'Fin de période d\'engagement', label: 'Fin de période d\'engagement' },
                                    { value: 'Déménagement', label: 'Déménagement' },
                                    { value: 'Augmentation de tarif non acceptée', label: 'Hausse de tarif (Loi Conso)' },
                                    { value: 'Service non fonctionnel', label: 'Service en panne / Dysfonctionnement' },
                                    { value: 'Autre motif', label: 'Autre motif (Convenance)' },
                                ]} 
                            />
                        </div>
                    </>
                )}

                {type === 'caution' && (
                    <>
                        <Input label="Adresse du logement loué *" name="rentedAddress" value={formData.rentedAddress} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-4">
                             <Input type="date" label="Date entrée *" name="moveInDate" value={formData.moveInDate} onChange={handleChange} />
                             <Input type="date" label="Date sortie *" name="moveOutDate" value={formData.moveOutDate} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <Input type="number" label="Caution (€) *" name="depositAmount" value={formData.depositAmount} onChange={handleChange} />
                             <Input type="number" label="Jours passés *" name="daysSinceDeparture" value={formData.daysSinceDeparture} onChange={handleChange} placeholder="Ex: 45" />
                        </div>
                        <Select 
                            label="L'état des lieux de sortie est-il conforme à l'entrée ?" 
                            name="isEDLConforme" 
                            value={formData.isEDLConforme} 
                            onChange={handleChange} 
                            options={[
                                { value: 'oui', label: 'Oui, tout est conforme' },
                                { value: 'non', label: 'Non, des dégradations notées' },
                            ]} 
                        />
                    </>
                )}

                {type === 'amende' && (
                    <>
                        <Input label="Numéro d'avis de contravention *" name="fineNumber" value={formData.fineNumber} onChange={handleChange} placeholder="3333 4444 55" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="date" label="Date de l'avis *" name="fineDate" value={formData.fineDate} onChange={handleChange} />
                            <Input label="Immatriculation *" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="AA-123-BB" />
                        </div>
                        <Select 
                            label="Motif de contestation *" 
                            name="reason" 
                            value={formData.reason} 
                            onChange={handleChange} 
                            options={[
                                { value: 'Véhicule cédé ou vendu', label: 'Cas n°1 : Véhicule vendu/cédé' },
                                { value: 'Véhicule volé', label: 'Cas n°1 : Véhicule volé' },
                                { value: 'Autre conducteur', label: 'Cas n°2 : Je ne conduisais pas (Prêt)' },
                                { value: 'Autre motif', label: 'Cas n°3 : Je conteste la réalité des faits' },
                            ]} 
                        />
                    </>
                )}
                
                <div className="pt-4 border-t border-slate-100 mt-2 space-y-3">
                     <SarahTip />
                     
                     <TextArea 
                        label="Racontez votre situation (Pour l'analyse IA)" 
                        name="customDetails" 
                        value={formData.customDetails || ''} 
                        onChange={handleChange} 
                        placeholder="Expliquez votre problème ici. Exemple : 'J'ai envoyé ma lettre de résiliation le 10/01 mais ils continuent de me prélever...' Ou 'Je n'étais pas au volant ce jour-là, je prêtais ma voiture à...'"
                        className="min-h-[120px]"
                    />
                </div>

             </div>
          )}

          {currentStep === 4 && (
             <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">4</span>
                    Pièces jointes & Preuves
                </h2>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700 leading-relaxed mb-4">
                    <strong>Pourquoi ajouter des preuves ?</strong><br/>
                    Mentionner "Ci-joint copie du bail" ou "Ci-joint copie du dépôt de plainte" renforce considérablement la valeur juridique de votre courrier.
                </div>

                <div className="">
                    <FileUpload 
                        label="Pièces jointes (Cités dans le courrier)" 
                        files={formData.attachmentNames || []} 
                        onFilesSelected={handleFilesSelected} 
                    />
                </div>

                {type === 'amende' && (
                     <div className="bg-amber-50 border border-amber-100 p-3 rounded text-amber-800 text-xs mt-2">
                        <strong>Important :</strong> Pour une contestation, l'original de l'avis de contravention est souvent requis par l'OMP.
                     </div>
                )}
             </div>
          )}

          {errorStep && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 animate-pulse flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {errorStep}
            </div>
          )}

          <div className="mt-auto pt-6 flex gap-3">
             {currentStep > 1 && (
                 <button 
                    type="button" 
                    onClick={handlePrev}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                 >
                    Retour
                 </button>
             )}
             
             {currentStep < 4 ? (
                 <button 
                    type="button" 
                    onClick={handleNext}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                 >
                    Suivant
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                 </button>
             ) : (
                 <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                 >
                    Générer le Courrier
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </button>
             )}
          </div>

        </form>
      </div>

    </div>
  );
};