// Ce fichier est désactivé car la fonction de stockage des leads a été supprimée
// Pour la version "Stripe & Go"
module.exports = async (req, res) => {
    res.status(200).json({ message: "Lead capture disabled" });
};