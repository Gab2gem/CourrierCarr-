import { jsPDF } from 'jspdf';
import { FormData, LetterType, TemplateResult } from '../types';
import { generateLetterContent } from './legalEngine';

export const generatePDF = (type: LetterType, data: FormData, overrideContent?: TemplateResult): void => {
  const doc = new jsPDF();
  // UTILISATION PRIORITAIRE DU CONTENU IA S'IL EXISTE
  const content = overrideContent || generateLetterContent(type, data);
  
  // -- CONFIGURATION --
  const pageWidth = 210; // A4 width in mm
  const leftMargin = 20;
  const rightMargin = 20;
  const maxLineWidth = pageWidth - leftMargin - rightMargin; // 170mm

  // -- FONT SETUP --
  doc.setFont("times", "bold");
  doc.setFontSize(12);

  // -- HEADER --
  // Centered, Uppercase, Underlined
  const headerText = "LETTRE RECOMMANDÉE AVEC ACCUSÉ DE RÉCEPTION";
  const textWidth = doc.getTextWidth(headerText);
  const xHeader = (pageWidth - textWidth) / 2;
  let yPos = 20;
  
  doc.text(headerText, xHeader, yPos);
  doc.setLineWidth(0.5);
  doc.line(xHeader, yPos + 2, xHeader + textWidth, yPos + 2); // Underline

  // -- SENDER (Top Left) --
  yPos = 40;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  
  const senderLines = [
    `${data.firstName.toUpperCase()} ${data.lastName.toUpperCase()}`,
    data.address,
    `${data.postalCode} ${data.city}`,
    data.phone || '',
    data.email
  ].filter(line => line !== '');
  
  senderLines.forEach(line => {
    doc.text(line, leftMargin, yPos);
    yPos += 5;
  });

  // -- RECIPIENT (Right, Boxed area feeling) --
  const recipientX = 110;
  let recipientY = 50;
  
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text(data.recipientName, recipientX, recipientY);
  recipientY += 5;
  
  doc.setFont("times", "normal");
  doc.text(data.recipientAddress, recipientX, recipientY); recipientY += 5;
  doc.text(`${data.recipientPostalCode} ${data.recipientCity}`, recipientX, recipientY); 

  // -- DATE (Right) --
  const dateY = 80;
  const dateStr = `Fait à ${data.city}, le ${new Date().toLocaleDateString('fr-FR')}`;
  doc.text(dateStr, recipientX, dateY);

  // -- SEPARATOR LINE --
  yPos = 95;
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
  
  // -- SUBJECT & REF --
  yPos += 15;
  doc.setFontSize(11);
  
  // Object
  doc.setFont("times", "bold");
  doc.text("Objet :", leftMargin, yPos);
  doc.setFont("times", "normal");
  // Wrap object text if too long
  const subjectText = content.subject.replace('Objet :', '').trim();
  const subjectLines = doc.splitTextToSize(subjectText, maxLineWidth - 15);
  doc.text(subjectLines, leftMargin + 15, yPos);
  
  yPos += (subjectLines.length * 5) + 2;
  
  // Ref
  if (content.legalReferences) {
    doc.setFont("times", "bold");
    doc.text("Réf :", leftMargin, yPos);
    doc.setFont("times", "italic");
    const refLines = doc.splitTextToSize(content.legalReferences, maxLineWidth - 15);
    doc.text(refLines, leftMargin + 15, yPos);
    yPos += (refLines.length * 5) + 5;
  } else {
    yPos += 10;
  }

  // -- BODY --
  yPos += 5;
  doc.setFontSize(11);
  
  const lineHeightFactor = 1.15; // Denser look

  content.body.forEach((paragraph) => {
    // 1. Check for SECTION HEADERS (Uppercase ending with :)
    const isHeader = /^[A-ZÀ-ÖØ-Þ ]+\s?:$/.test(paragraph);
    // 2. Check for BULLET POINTS
    const isBullet = paragraph.trim().startsWith('•');

    if (isHeader) {
      yPos += 4; // Extra space before header
      doc.setFont("times", "bold");
      doc.text(paragraph, leftMargin, yPos);
      doc.setFont("times", "normal");
      yPos += 6;
    } else if (isBullet) {
      // Indent bullet points
      const bulletMargin = leftMargin + 10;
      const bulletWidth = maxLineWidth - 10;
      const lines = doc.splitTextToSize(paragraph, bulletWidth);
      
      // Check page break
      if (yPos + (lines.length * 5) > 275) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(lines, bulletMargin, yPos, { lineHeightFactor });
      yPos += (lines.length * 5) + 2;
    } else {
      // Normal paragraph
      const lines = doc.splitTextToSize(paragraph, maxLineWidth);
      
      // Check page break
      if (yPos + (lines.length * 5) > 275) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(lines, leftMargin, yPos, { lineHeightFactor });
      yPos += (lines.length * 5) + 5; // Spacing between paragraphs
    }
  });

  // -- SIGNATURE --
  yPos += 10;
  if (yPos + 30 > 280) {
    doc.addPage();
    yPos = 30;
  }
  
  const signatureX = 110;
  doc.setFont("times", "normal");
  doc.text("Signature :", signatureX, yPos);
  
  // Draw a box or line for signature
  // doc.rect(signatureX, yPos + 5, 60, 25); // Optional Box
  
  yPos += 25;
  doc.setFont("times", "bold");
  doc.text(`${data.firstName} ${data.lastName}`, signatureX, yPos);

  doc.save(`Courrier_Juridique_${type}.pdf`);
};