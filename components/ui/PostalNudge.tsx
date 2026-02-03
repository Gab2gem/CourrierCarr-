import React from 'react';

export const PostalNudge: React.FC<{ className?: string }> = ({ className }) => {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  const isBeforeCutoff = hour < 15;

  let icon = "🌙";
  let title = "Préparez votre envoi pour demain";
  let text = "Évitez la file d'attente en imprimant votre lettre ce soir.";
  let colorClass = "bg-indigo-50 border-indigo-200 text-indigo-800";

  if (isWeekend) {
    icon = "📮";
    title = "Gagnez du temps sur votre lundi";
    text = "Votre dossier prêt à poster dès la première levée.";
    colorClass = "bg-blue-50 border-blue-200 text-blue-800";
  } else if (isBeforeCutoff) {
    icon = "⚡️";
    title = "Départ courrier aujourd'hui";
    text = "Téléchargez avant 15h30 pour l'imprimer et le poster ce soir.";
    colorClass = "bg-amber-50 border-amber-200 text-amber-800";
  }

  return (
    <div className={`flex items-start md:items-center gap-3 border px-4 py-3 rounded-lg text-sm shadow-sm ${colorClass} ${className || ''}`}>
      <span className="text-xl mt-0.5 md:mt-0">{icon}</span>
      <div className="text-left">
        <span className="font-bold block text-xs md:text-sm">{title}</span>
        <span className="opacity-90 text-xs md:text-sm leading-tight block">{text}</span>
      </div>
    </div>
  );
};