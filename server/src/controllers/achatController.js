const db = require("../config/db");
const { updateStock } = require("./produitController");

exports.createAchat = (req, res) => {
  const { fournisseur_id, total, date_achat, utilisateur_id, produits } = req.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
      `INSERT INTO achats (fournisseur_id, date_achat, total, utilisateur_id) VALUES (?, ?, ?, ?)`,
      [fournisseur_id, date_achat, total, utilisateur_id],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: "Erreur lors de l'ajout de l'achat" });
        }

        const achat_id = this.lastID;

        // Fonction pour insérer un détail et mettre à jour stock
        const insertAndUpdate = (p) => {
          return new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO achats_details (achat_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)`,
              [achat_id, p.produit_id, p.quantite, p.prix_unitaire, p.total],
              function (err) {
                if (err) return reject(err);

                updateStock(p.produit_id, p.quantite, (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              }
            );
          });
        };

        (async () => {
          try {
            for (const produit of produits) {
              await insertAndUpdate(produit);
            }
            db.run("COMMIT");
            res.status(201).json({ message: "Achat ajouté avec succès", achat_id });
          } catch (error) {
            db.run("ROLLBACK");
            res.status(500).json({
              error: "Erreur lors de l'ajout des détails ou mise à jour du stock",
              details: error.message,
            });
          }
        })();
      }
    );
  });
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
