const db = require("../config/db");
const { updateStock } = require("./produitController");

// Créer une nouvelle vente
exports.createVente = (req, res) => {
  const { client_id, total, date_vente, utilisateur_id, produits } = req.body;

  db.serialize(() => {
    // Commencer une transaction
    db.run("BEGIN TRANSACTION");

    // Insérer la vente dans la table 'ventes'
    db.run(
      "INSERT INTO ventes (client_id, date_vente, total, utilisateur_id) VALUES (?, ?, ?, ?)",
      [client_id, date_vente, total, utilisateur_id],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({
            message: "Erreur lors de la création de la vente",
            error: err,
          });
        }

        const venteId = this.lastID;

        // Ajouter les détails de la vente dans 'ventes_details'
        const detailQuery =
          "INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)";
        const details = produits.map((prod) => [
          venteId,
          prod.produit_id,
          prod.quantite,
          prod.prix_unitaire,
          prod.quantite * prod.prix_unitaire, // Calcul du total pour chaque produit
        ]);

        const insertDetails = db.prepare(detailQuery);

        details.forEach((detail) => {
          insertDetails.run(detail, (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({
                message: "Erreur lors de l'ajout des détails de la vente",
                error: err,
              });
            }

            // Mettre à jour le stock après chaque produit vendu
            updateStock(detail[1], -detail[2], (err) => {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({
                  message: "Erreur lors de la mise à jour du stock",
                  error: err,
                });
              }
            });
          });
        });

        insertDetails.finalize();

        db.run("COMMIT");
        res.status(201).json({ message: "Vente créée avec succès", venteId });
      }
    );
  });
};

// Récupérer toutes les ventes
exports.getAllVentes = (req, res) => {
  db.all("SELECT * FROM ventes", (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des ventes",
        error: err,
      });
    }
    res.status(200).json(rows);
  });
};

// Récupérer une vente par son ID
exports.getVenteById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM ventes WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération de la vente",
        error: err,
      });
    }
    if (!row) {
      return res.status(404).json({ message: "Vente non trouvée" });
    }
    res.status(200).json(row);
  });
};

exports.deleteVente = (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.all("SELECT * FROM ventes_details WHERE vente_id = ?", [id], (err, details) => {
      if (err) {
        db.run("ROLLBACK");
        console.error("Erreur récupération détails :", err);
        return res.status(500).json({ message: "Erreur lors de la récupération des détails de la vente" });
      }

      if (details.length === 0) {
        db.run("ROLLBACK");
        return res.status(404).json({ message: "Aucun détail trouvé pour cette vente" });
      }

      // Fonction récursive pour éviter les problèmes de forEach + callbacks
      const restoreNextStock = (index) => {
        if (index >= details.length) {
          // Suppression des détails
          db.run("DELETE FROM ventes_details WHERE vente_id = ?", [id], function (err) {
            if (err) {
              db.run("ROLLBACK");
              console.error("Erreur suppression détails :", err);
              return res.status(500).json({ message: "Erreur suppression détails de vente" });
            }

            // Suppression de la vente
            db.run("DELETE FROM ventes WHERE id = ?", [id], function (err) {
              if (err) {
                db.run("ROLLBACK");
                console.error("Erreur suppression vente :", err);
                return res.status(500).json({ message: "Erreur suppression de la vente" });
              }

              db.run("COMMIT");
              res.status(200).json({ message: "Vente supprimée avec succès" });
            });
          });
          return;
        }

        const detail = details[index];
        updateStock(detail.produit_id, detail.quantite, (err) => {
          if (err) {
            db.run("ROLLBACK");
            console.error("Erreur restauration stock :", err);
            return res.status(500).json({ message: "Erreur lors de la restauration du stock", error: err.message });
          }

          restoreNextStock(index + 1);
        });
      };

      restoreNextStock(0); // lancer le premier
    });
  });
};