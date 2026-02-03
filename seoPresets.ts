import { LetterType } from '../types';

export interface SeoPreset {
  slug: string;
  title: string; // Balise Title
  h1: string; // Titre principal de la page
  description: string; // Meta description pour Google
  content: string[]; // Paragraphes d'introduction SEO
  type: LetterType;
  presetKey: string;
}

export const SEO_PRESETS: Record<string, SeoPreset> = {
  'resiliation-basic-fit': {
    slug: 'resiliation-basic-fit',
    title: 'Lettre de Résiliation Basic Fit - Modèle Gratuit 2025',
    h1: 'Résilier votre abonnement Basic Fit',
    description: 'Modèle de lettre de résiliation Basic Fit prêt à l\'envoi. Invoquez les bons articles de loi pour arrêter les prélèvements immédiatement.',
    content: [
      "Vous souhaitez mettre fin à votre abonnement à la salle de sport Basic-Fit ? La procédure exige l'envoi d'une lettre recommandée avec accusé de réception, adressée directement au siège aux Pays-Bas.",
      "Notre générateur utilise l'adresse officielle de résiliation (Postbus 3124) et cite automatiquement les articles du Code de la consommation pour garantir la prise en compte de votre demande, que ce soit pour une fin d'engagement, un déménagement ou un problème médical."
    ],
    type: 'resiliation',
    presetKey: 'basic-fit'
  },
  'resiliation-free-mobile': {
    slug: 'resiliation-free-mobile',
    title: 'Lettre de Résiliation Free Mobile - Adresse & Modèle',
    h1: 'Résilier votre forfait Free Mobile',
    description: 'Générez votre lettre de résiliation Free Mobile avec l\'adresse officielle 2025. Arrêtez votre forfait sans frais grâce à la loi Châtel.',
    content: [
      "Pour résilier votre forfait Free Mobile (Forfait 2€ ou Forfait Free 5G), l'envoi d'un recommandé est la méthode la plus sûre pour conserver une preuve juridique.",
      "Ce modèle inclut l'adresse du Service Résiliation à Paris (75371) et adapte le texte selon que vous souhaitiez conserver votre numéro (portabilité RIO) ou non."
    ],
    type: 'resiliation',
    presetKey: 'free'
  },
  'resiliation-sfr': {
    slug: 'resiliation-sfr',
    title: 'Lettre de Résiliation SFR Box et Mobile',
    h1: 'Résilier votre contrat SFR',
    description: 'Adresse de résiliation SFR (TSA 13920) et modèle de lettre conforme. Résiliez votre Box ou Mobile en quelques clics.',
    content: [
      "La résiliation d'une offre SFR (Box ou Mobile) nécessite l'envoi d'un courrier au service client d'Arras.",
      "Notre modèle intègre automatiquement les motifs légitimes d'exonération de frais (déménagement en zone non couverte, hausse de tarif, etc.) pour protéger vos droits."
    ],
    type: 'resiliation',
    presetKey: 'sfr'
  },
  'resiliation-bouygues': {
    slug: 'resiliation-bouygues',
    title: 'Lettre de Résiliation Bouygues Telecom',
    h1: 'Résilier Bouygues Telecom (Bbox / Mobile)',
    description: 'Modèle certifié pour résilier Bouygues Telecom. Adresse TSA 59013 incluse. PDF prêt à imprimer.',
    content: [
      "Vous mettez fin à votre contrat Bbox ou forfait Sensation ? Utilisez ce modèle pré-rempli à destination du Service Clients de Chantilly.",
      "Conformément aux Conditions Générales de Service, la résiliation prend effet 10 jours après réception de ce courrier recommandé."
    ],
    type: 'resiliation',
    presetKey: 'bouygues'
  },
  'resiliation-canal-plus': {
    slug: 'resiliation-canal-plus',
    title: 'Lettre de Résiliation Canal+ / CanalSat',
    h1: 'Résilier votre abonnement Canal+',
    description: 'Attention aux dates anniversaires ! Utilisez ce modèle pour résilier Canal+ en respectant la loi Châtel.',
    content: [
      "Canal+ est strict sur les dates anniversaires. Ce courrier cite la Loi Châtel pour vous défendre si vous n'avez pas reçu votre avis d'échéance à temps.",
      "L'adresse de Cergy-Pontoise est pré-remplie pour éviter tout retour de courrier."
    ],
    type: 'resiliation',
    presetKey: 'canal'
  },
  'resiliation-assurance': {
    slug: 'resiliation-assurance',
    title: 'Lettre de Résiliation Assurance (Loi Hamon)',
    h1: 'Résilier une assurance (Auto/Habitation/Mobile)',
    description: 'Utilisez la Loi Hamon pour résilier votre assurance à tout moment après un an. Modèle universel.',
    content: [
      "Grâce à la Loi Hamon, vous pouvez résilier vos contrats d'assurance (auto, moto, habitation) à tout moment après la première année d'engagement.",
      "Notre intelligence artificielle adaptera le courrier pour citer l'article L.113-15-2 du Code des assurances."
    ],
    type: 'resiliation',
    presetKey: 'assurance'
  },
  'restitution-caution': {
    slug: 'restitution-caution',
    title: 'Mise en demeure Restitution Caution - Modèle',
    h1: 'Récupérer votre Dépôt de Garantie',
    description: 'Votre propriétaire garde votre caution ? Générez une mise en demeure citant la loi de 1989 pour récupérer votre argent + 10% de pénalités.',
    content: [
      "Le délai légal est dépassé ? Le propriétaire retient des sommes sans factures ?",
      "Ce courrier est une mise en demeure formelle. Il cite l'article 22 de la loi du 6 juillet 1989 pour exiger le remboursement immédiat et l'application des pénalités de retard (10% du loyer par mois)."
    ],
    type: 'caution',
    presetKey: ''
  },
  'contestation-amende': {
    slug: 'contestation-amende',
    title: 'Contestation Amende Radar / Stationnement',
    h1: 'Contester une contravention (ANTAI)',
    description: 'Requête en exonération pour contester une amende radar ou stationnement. Modèle pour l\'Officier du Ministère Public.',
    content: [
      "Ne payez pas si vous contestez ! La consignation peut être nécessaire, mais la requête doit être parfaitement motivée.",
      "Ce modèle structure votre demande selon les cas prévus par le Code de procédure pénale (véhicule vendu, volé, prêté ou contestation de la réalité de l'infraction)."
    ],
    type: 'amende',
    presetKey: ''
  }
};