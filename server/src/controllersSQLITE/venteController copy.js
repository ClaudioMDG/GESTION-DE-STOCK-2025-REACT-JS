const db = require("../config/db");
const { updateStock } = require("./produitController");

// Créer une nouvelle vente
exports.createVente = (req, res) => {
  const { client_id, total, date_vente, utilisateur_id, produits } = req.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Étape 1 : Vérifier les stocks pour tous les produits
    const checkStockPromises = produits.map((prod) => {
      return new Promise((resolve, reject) => {
        if (prod.quantite <= 0) {
          return reject(
            new Error(`Quantité invalide pour le produit ID ${prod.produit_id}`)
          );
        }

        db.get(
          `SELECT quantite_en_stock FROM produits WHERE id = ?`,
          [prod.produit_id],
          (err, row) => {
            if (err) return reject(err);
            if (!row) {
              return reject(
                new Error(`Produit ID ${prod.produit_id} introuvable.`)
              );
            }
            if (row.quantite_en_stock < prod.quantite) {
              return reject(
                new Error(
                  `Stock insuffisant pour le produit ID ${prod.produit_id}. En stock: ${row.quantite_en_stock}, demandé: ${prod.quantite}`
                )
              );
            }
            resolve(); // Stock OK
          }
        );
      });
    });

    // Étape 2 : Après validation des stocks, insérer la vente
    Promise.all(checkStockPromises)
      .then(() => {
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

            const insertDetailAndUpdate = (prod) => {
              return new Promise((resolve, reject) => {
                const totalProduit = prod.quantite * prod.prix_unitaire;
                db.run(
                  `INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)`,
                  [venteId, prod.produit_id, prod.quantite, prod.prix_unitaire, totalProduit],
                  (err) => {
                    if (err) return reject(err);

                    updateStock(prod.produit_id, -prod.quantite, (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  }
                );
              });
            };

            // Traiter tous les produits un par un
            (async () => {
              try {
                for (const prod of produits) {
                  await insertDetailAndUpdate(prod);
                }
                db.run("COMMIT");
                res.status(201).json({ message: "Vente créée avec succès", venteId });
              } catch (err) {
                db.run("ROLLBACK");
                res.status(500).json({
                  message: "Erreur lors de l'insertion des détails ou mise à jour du stock",
                  error: err.message,
                });
              }
            })();
          }
        );
      })
      .catch((err) => {
        db.run("ROLLBACK");
        res.status(400).json({ message: "Vente refusée", error: err.message });
      });
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

    db.all(
      "SELECT * FROM ventes_details WHERE vente_id = ?",
      [id],
      (err, details) => {
        if (err) {
          db.run("ROLLBACK");
          console.error("Erreur récupération détails :", err);
          return res.status(500).json({
            message: "Erreur lors de la récupération des détails de la vente",
          });
        }

        if (details.length === 0) {
          db.run("ROLLBACK");
          return res
            .status(404)
            .json({ message: "Aucun détail trouvé pour cette vente" });
        }

        // Fonction récursive pour éviter les problèmes de forEach + callbacks
        const restoreNextStock = (index) => {
          if (index >= details.length) {
            // Suppression des détails
            db.run(
              "DELETE FROM ventes_details WHERE vente_id = ?",
              [id],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  console.error("Erreur suppression détails :", err);
                  return res
                    .status(500)
                    .json({ message: "Erreur suppression détails de vente" });
                }

                // Suppression de la vente
                db.run("DELETE FROM ventes WHERE id = ?", [id], function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    console.error("Erreur suppression vente :", err);
                    return res
                      .status(500)
                      .json({ message: "Erreur suppression de la vente" });
                  }

                  db.run("COMMIT");
                  res
                    .status(200)
                    .json({ message: "Vente supprimée avec succès" });
                });
              }
            );
            return;
          }

          const detail = details[index];
          updateStock(detail.produit_id, detail.quantite, (err) => {
            if (err) {
              db.run("ROLLBACK");
              console.error("Erreur restauration stock :", err);
              return res.status(500).json({
                message: "Erreur lors de la restauration du stock",
                error: err.message,
              });
            }

            restoreNextStock(index + 1);
          });
        };

        restoreNextStock(0); // lancer le premier
      }
    );
  });
};
