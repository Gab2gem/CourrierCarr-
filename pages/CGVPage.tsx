import React from 'react';
import { Link } from 'react-router-dom';

export const CGVPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-slate-800">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 text-sm mb-8">
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-slate-900">Conditions Générales de Vente (CGV)</h1>
      <p className="text-sm text-slate-500 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <div className="space-y-8 text-sm leading-relaxed">
        
        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 1 - Objet</h2>
          <p>
            Les présentes conditions régissent les ventes par la société CourrierCarré (ci-après "le Vendeur") de documents administratifs et juridiques au format numérique (PDF) générés automatiquement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 2 - Prix</h2>
          <p>
            Les prix de nos produits sont indiqués en euros toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 3 - Paiement et Sécurisation</h2>
          <p>
            Le règlement de vos achats s'effectue par carte bancaire. Les paiements sont sécurisés par notre partenaire Stripe. Aucune donnée bancaire n'est conservée par CourrierCarré.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 4 - Livraison</h2>
          <p>
            Les produits sont livrés immédiatement après paiement sous forme de téléchargement direct (fichier PDF) sur la page de confirmation, ainsi que par email si l'option a été sélectionnée.
          </p>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-bold mb-3 text-blue-900">Article 5 - Rétractation (Important)</h2>
          <p className="text-blue-800">
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation.
          </p>
          <p className="mt-3 font-semibold text-blue-900">
            En validant votre commande et en téléchargeant votre document, vous acceptez expressément que la prestation commence immédiatement et vous renoncez à votre droit de rétractation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 6 - Responsabilité</h2>
          <p>
            CourrierCarré fournit des modèles de lettres générés à partir des informations saisies par l'utilisateur. Le Vendeur n'est pas un cabinet d'avocats et ne fournit pas de conseil juridique personnalisé. L'utilisateur est seul responsable de l'exactitude des informations fournies et de l'utilisation qu'il fait du document généré.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">Article 7 - Données personnelles</h2>
          <p>
            Les informations recueillies sont nécessaires pour le traitement de votre commande. Elles ne sont ni vendues ni échangées. Conformément à la loi "Informatique et Libertés", vous disposez d'un droit d'accès et de rectification aux données vous concernant.
          </p>
        </section>

      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
         <p className="text-xs text-slate-400">CourrierCarré SAS (Fictif pour démo) - 12 rue de la Paix 75000 Paris</p>
      </div>
    </div>
  );
};