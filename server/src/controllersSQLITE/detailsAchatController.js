const db = require('../config/db');

// Ajouter un détail d'achat
exports.addDetailsAchat = (req, res) => {
  const { achat_id, produit_id, quantite, prix_unitaire, total } = req.body;

  if (!achat_id || !produit_id || !quantite || !prix_unitaire || !total) {
    return res.status(400).json({ error: 'Les données sont incomplètes ou invalides' });
  }

  // Ajouter un détail d'achat
  db.run(
    `INSERT INTO achats_details (achat_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)`,
    [achat_id, produit_id, quantite, prix_unitaire, total],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du détail d\'achat' });
      }
      res.status(201).json({ message: 'Détail d\'achat ajouté avec succès', detail_id: this.lastID });
    }
  );
};

// Récupérer les détails d'un achat
exports.getDetailsByAchatId = (req, res) => {
  const { achat_id } = req.params;

  const query = `
  SELECT 
    vd.*, 
    p.nom AS produit_nom 
  FROM 
    achats_details vd
  LEFT JOIN 
    produits p ON vd.produit_id = p.id
  WHERE 
    vd.achat_id = ?;
`;
  db.all(query, [achat_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des détails de l\'achat' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aucun détail trouvé pour cet achat' });
    }
    res.status(200).json(rows);
  });
};
