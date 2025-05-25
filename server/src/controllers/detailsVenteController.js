const db = require("../config/db");

// Ajouter les détails d'une vente
exports.addDetailsVente = (req, res) => {
  const { vente_id, produit_id, quantite, prix_unitaire } = req.body;

  const total = quantite * prix_unitaire; // Calcul du total pour le produit

  db.run(
    "INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)",
    [vente_id, produit_id, quantite, prix_unitaire, total],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de l'ajout du détail de la vente", error: err });
      }
      res.status(201).json({ message: "Détail de vente ajouté avec succès", detailId: this.lastID });
    }
  );
};

// Récupérer les détails d'une vente avec le nom du produit
exports.getDetailsByVenteId = (req, res) => {
  const { vente_id } = req.params;

  // Requête SQL avec jointure pour récupérer le nom du produit
  const query = `
    SELECT 
      vd.*, 
      p.nom AS produit_nom 
    FROM 
      ventes_details vd
    LEFT JOIN 
      produits p ON vd.produit_id = p.id
    WHERE 
      vd.vente_id = ?;
  `;

  db.all(query, [vente_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la récupération des détails de la vente", error: err });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Détails de vente non trouvés" });
    }

    res.status(200).json(rows);
  });
};

