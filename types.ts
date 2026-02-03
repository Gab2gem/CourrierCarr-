export type LetterType = 'resiliation' | 'caution' | 'amende';

export interface FormData {
  // Sender Info
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone?: string;

  // Recipient Info
  recipientName: string;
  recipientAddress: string;
  recipientPostalCode: string;
  recipientCity: string;

  // Specifics
  contractNumber?: string; // For Resiliation
  subscriptionDate?: string; // For Resiliation (NEW)
  reason?: string; // For Resiliation & Amende
  
  // Caution Specifics
  rentedAddress?: string; // NEW: Adresse du logement loué (différente de l'adresse expéditeur)
  moveInDate?: string; // NEW: Date d'entrée
  moveOutDate?: string; // For Caution
  depositAmount?: string; // For Caution
  isEDLConforme?: string; // NEW: 'oui' | 'non'
  daysSinceDeparture?: string; // NEW

  // Amende Specifics
  fineNumber?: string; // For Amende
  fineDate?: string; // For Amende
  licensePlate?: string; // For Amende
  tribunalName?: string; // NEW
  tribunalAddress?: string; // NEW
  attachmentNames?: string[]; // NEW: List of attached filenames

  // User Story
  customDetails?: string;
}

export interface TemplateResult {
  subject: string;
  body: string[]; // Array of paragraphs for easier PDF rendering
  legalReferences: string;
}