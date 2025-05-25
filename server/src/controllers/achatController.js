const db = require("../config/db");

// Créer un achat
exports.createAchat = (req, res) => {
  const { fournisseur_id, total, date_achat, utilisateur_id, produits } =
    req.body;

  // if (!fournisseur_id || !total || !date_achat || !utilisateur_id || !produits || produits.length === 0) {
  //   return res.status(400).json({ error: 'Les données sont incomplètes ou invalides' });
  // }

  // Ajouter l'achat dans la table 'achats'
  db.run(
    `INSERT INTO achats (fournisseur_id, date_achat, total, utilisateur_id) VALUES (?, ?, ?, ?)`,
    [fournisseur_id, date_achat, total, utilisateur_id],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erreur lors de l'ajout de l'achat" });
      }

      const achat_id = this.lastID; // Récupérer l'ID du nouvel achat

      // Ajouter les détails de l'achat dans la table 'achats_details'
      const achatsDetails = produits.map((p) => {
        const { produit_id, quantite, prix_unitaire, total } = p;
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO achats_details (achat_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)`,
            [achat_id, produit_id, quantite, prix_unitaire, total],
            function (err) {
              if (err) reject(err);
              resolve();
            }
          );
        });
      });

      // Attendre que tous les détails de l'achat soient ajoutés
      Promise.all(achatsDetails)
        .then(() => {
          return res
            .status(201)
            .json({ message: "Achat ajouté avec succès", achat_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Erreur lors de l'ajout des détails de l'achat" });
        });
    }
  );
};

// Récupérer tous les achats
exports.getAllAchats = (req, res) => {
  db.all("SELECT * FROM achats", [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des achats" });
    }
    res.status(200).json(rows);
  });
};

// Récupérer un achat par ID
exports.getAchatById = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM achats WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'achat" });
    }
    if (!row) {
      return res.status(404).json({ message: "Achat non trouvé" });
    }
    res.status(200).json(row);
  });
};

// Supprimer un achat
exports.deleteAchat = (req, res) => {
  const { id } = req.params;

  // Supprimer les détails de l'achat
  db.run(`DELETE FROM achats_details WHERE achat_id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({
        error: "Erreur lors de la suppression des détails de l'achat",
      });
    }

    // Supprimer l'achat de la table 'achats'
    db.run(`DELETE FROM achats WHERE id = ?`, [id], function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erreur lors de la suppression de l'achat" });
      }

      // Vérifier si l'achat a bien été supprimé
      if (this.changes === 0) {
        return res.status(404).json({ message: "Achat non trouvé" });
      }

      res.status(200).json({ message: "Achat supprimé avec succès" });
    });
  });
};
