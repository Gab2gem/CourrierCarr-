export const api = {
  /**
   * Appelle le backend pour créer une session Stripe
   */
  createCheckoutSession: async (): Promise<string | null> => {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (data.url) return data.url;
        throw new Error(data.error || 'No URL returned');
    } catch (error) {
        console.error("Payment Error:", error);
        alert("Erreur de connexion au service de paiement. Vérifiez votre configuration API.");
        return null;
    }
  },

  /**
   * Vérifie si le code promo est valide (Logique Client pour l'instant pour la rapidité)
   */
  checkPromoCode: async (code: string): Promise<{ valid: boolean; discount: number; type: string }> => {
    // Simulation rapide, pourrait être déplacée côté serveur si besoin de cacher les codes
    const normalized = code.trim().toUpperCase();
    if (normalized === 'WELCOME') return { valid: true, discount: 0.5, type: 'percent' };
    if (normalized === 'GRATUIT') return { valid: true, discount: 1, type: 'percent' };
    
    return { valid: false, discount: 0, type: 'none' };
  }
};