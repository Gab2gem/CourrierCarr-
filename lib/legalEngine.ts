import { FormData, LetterType, TemplateResult } from '../types';

export const generateLetterContent = (type: LetterType, data: FormData): TemplateResult => {
  switch (type) {
    case 'resiliation':
      return generateResiliation(data);
    case 'caution':
      return generateCaution(data);
    case 'amende':
      return generateAmende(data);
    default:
      return { subject: '', body: [], legalReferences: '' };
  }
};

const generateResiliation = (data: FormData): TemplateResult => {
  const reasonLower = data.reason?.toLowerCase() || "";
  const isMoving = reasonLower.includes('déménagement');
  const isPriceIncrease = reasonLower.includes('augmentation') || reasonLower.includes('tarif');
  
  // Format date if present
  let subscriptionText = '';
  if (data.subscriptionDate) {
    try {
        subscriptionText = ` souscrit en date du ${new Date(data.subscriptionDate).toLocaleDateString('fr-FR')}`;
    } catch (e) {
        subscriptionText = ` souscrit le ${data.subscriptionDate}`;
    }
  }

  const body = [
    `Madame, Monsieur,`,
    
    `Par la présente lettre recommandée avec avis de réception, je vous notifie formellement la résiliation du contrat d'abonnement n° ${data.contractNumber || '[NUMERO]'}${subscriptionText}.`,
    
    `Cette résiliation est motivée par les faits suivants : ${data.reason || "Convenance personnelle"}.`,

    `FONDEMENT LÉGAL ET JURISPRUDENTIEL :`,
  ];

  // Logic for the Law Paragraph (Fallback if AI doesn't run)
  let lawParagraph = "";
  let legalRef = "";

  if (isPriceIncrease) {
    lawParagraph = `Il convient de rappeler qu'en vertu de l'article L.224-33 du Code de la consommation, toute modification unilatérale des conditions contractuelles ouvre droit à résiliation sans frais. À cet égard, la notification légale requise ne m'ayant pas été opposée valablement, le délai de forclusion de quatre mois est inopérant en l'espèce.`;
    legalRef = "Code de la consommation (Art. L.224-33)";
  } else if (isMoving) {
    lawParagraph = `Le déménagement constitue un motif légitime de résiliation reconnu par la jurisprudence constante (Cour de Cassation) et vos propres Conditions Générales de Vente. Cette rupture de contrat s'opère donc de plein droit, sans pénalités, ni frais de fermeture d'accès.`;
    legalRef = "Jurisprudence (Motif légitime) & CGV";
  } else {
    // Default Chatel/Hamon
    lawParagraph = `Conformément aux dispositions d'ordre public de l'article L.215-1 du Code de la consommation, le droit de résiliation unilatérale est acquis au consommateur post-engagement.`;
    legalRef = "Code de la consommation (Art. L.215-1 et suivants)";
  }

  body.push(lawParagraph);

  // SPECIFIQUE DEMENAGEMENT : Mention de la pièce jointe dans le corps
  if (isMoving) {
      body.push(`À cet effet, vous trouverez jointe à la présente la copie de mon justificatif de domicile (bail, facture ou attestation), prouvant la réalité de ce changement de situation.`);
  }

  body.push(
    `CONCLUSIONS ET DEMANDES :`,
    `En conséquence, je vous mets en demeure de :`,
    `• Procéder à la résiliation effective du contrat à réception de la présente.`,
    `• Me confirmer par écrit la date de fin de contrat qui ne saurait excéder dix jours francs suivant la réception de ce courrier (Art. L.224-39).`,
    `• Cesser tout prélèvement bancaire sous peine de poursuites pour prélèvement indu.`,
    `• Etablir et me transmettre la facture de clôture de compte.`,
  );

  if (data.customDetails) {
    body.splice(3, 0, `OBSERVATIONS COMPLÉMENTAIRES :`, data.customDetails);
  }

  body.push(
    `AVERTISSEMENT :`,
    `À défaut d'exécution diligente de ces obligations légales, je me réserve le droit de saisir la juridiction compétente ainsi que les services de la DGCCRF.`
  );

  body.push(`Dans cette attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`);

  // SPECIFIQUE DEMENAGEMENT : Section P.J. en bas
  if (isMoving) {
      body.push(`P.J. : Copie du justificatif de nouveau domicile.`);
  }

  return {
    subject: `Objet : RÉSILIATION DE CONTRAT N° ${data.contractNumber} - Mise en demeure`,
    body,
    legalReferences: legalRef
  };
};

const generateCaution = (data: FormData): TemplateResult => {
  const isConforme = data.isEDLConforme === 'oui';
  const delayLimit = isConforme ? "un mois" : "deux mois";
  
  // Format entry date
  let moveInText = '';
  if (data.moveInDate) {
      try { moveInText = ` occupés depuis le ${new Date(data.moveInDate).toLocaleDateString('fr-FR')}`; } catch (e) {}
  }

  const body = [
    `Madame, Monsieur,`,

    `J'ai occupé en qualité de locataire les lieux situés au ${data.rentedAddress || data.address}${moveInText}.`,
    
    `Le bail a pris fin le ${data.moveOutDate ? new Date(data.moveOutDate).toLocaleDateString('fr-FR') : '[DATE]'}, date à laquelle la restitution des clés a été opérée contradictoirement.`,
    
    isConforme 
        ? `L'état des lieux de sortie ayant été déclaré conforme à l'entrée, le délai de restitution du dépôt de garantie est impérativement réduit à un mois.`
        : `Concernant la restitution du dépôt de garantie, le délai légal de rigueur est de deux mois à compter de la remise des clés.`,

    `Or, force est de constater qu'à ce jour, le délai légal étant expiré, je ne suis toujours pas en possession de la somme de ${data.depositAmount || '0'} €.`,

    `FONDEMENT JURIDIQUE :`,
    
    `L'article 22 de la loi n° 89-462 du 6 juillet 1989 est formel : à défaut de restitution dans les délais impartis, le dépôt de garantie restant dû est majoré d'une somme égale à 10 % du loyer mensuel en principal, pour chaque période mensuelle commencée en retard.`,

    `CONCLUSIONS ET DEMANDES :`,
    
    `Je vous mets en demeure par la présente de :`,
    `• Procéder au virement immédiat de la somme principale de ${data.depositAmount} €.`,
    `• Vous acquitter des pénalités de retard (10% du loyer par mois) calculées de plein droit à compter de la date d'exigibilité.`,
    `• Justifier par des factures acquittées (et non de simples devis) toute retenue opérée, le cas échéant.`
  ];

  if (data.customDetails) {
    body.splice(3, 0, `OBSERVATIONS :`, data.customDetails);
  }

  body.push(
    `MISE EN GARDE :`,
    `Faute de réception des fonds sous huitaine, je saisirai la Commission Départementale de Conciliation et, si nécessaire, le Juge des Contentieux de la Protection aux fins d'injonction de payer.`
  );

  body.push(`Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`);

  return {
    subject: `Objet : MISE EN DEMEURE - Restitution du dépôt de garantie et pénalités`,
    body,
    legalReferences: 'Loi n° 89-462 du 6 juillet 1989, Article 22'
  };
};

const generateAmende = (data: FormData): TemplateResult => {
  // Correction: Utilisation d'une mention générique si le tribunal n'est pas renseigné
  const tribunalMention = data.tribunalName 
    ? ` auprès du ${data.tribunalName}` 
    : ' auprès de la juridiction de proximité compétente';

  const body = [
    `Monsieur l'Officier du Ministère Public,`,

    `Je forme par la présente une requête en exonération à l'encontre de l'avis de contravention n° ${data.fineNumber || '[NUMERO]'} dressé le ${data.fineDate || '[DATE]'} concernant le véhicule immatriculé ${data.licensePlate || '[PLAQUE]'} ${tribunalMention}.`,

    `CADRE LÉGAL DE LA REQUÊTE :`,
    
    `Cette contestation est introduite sur le fondement des articles 529-2 et 530 du Code de procédure pénale. La consignation préalable, si requise, a été effectuée.`,

    `MOTIFS DE FAIT ET DE DROIT :`,
    
    `Je conteste formellement la matérialité de l'infraction ou son imputabilité pour le motif suivant : ${data.reason || "Cas n°3 - Autre motif"}.`,
  ];

  if (data.customDetails) {
    body.push(`EXPOSÉ DES FAITS :`, data.customDetails);
  }

  body.push(
    `CONCLUSIONS :`,
    `• À titre principal, je sollicite le classement sans suite de cette contravention.`,
    `• À titre subsidiaire, je demande expressément à être entendu par la juridiction de proximité compétente afin d'y faire valoir mes moyens de défense, conformément à l'article 6 de la CEDH.`,
    `• Vous trouverez ci-joint l'original de l'avis et le formulaire de requête dûment complété.`
  );

  body.push(`Je vous prie de croire, Monsieur l'Officier du Ministère Public, en l'assurance de ma considération respectueuse.`);

  return {
    subject: `Objet : REQUÊTE EN EXONÉRATION - Avis n° ${data.fineNumber}`,
    body,
    legalReferences: 'Code de procédure pénale, Articles 529-2 et 530'
  };
};