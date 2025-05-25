const db = require("../config/db");

// Ajouter une vente
const addVente = (vente, callback) => {
  const { client_id, date_vente, total, utilisateur_id } = vente;

  const query = `
    INSERT INTO ventes (client_id, date_vente, total, utilisateur_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [client_id, date_vente, total, utilisateur_id], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, this.lastID); // Retourne l'ID de la vente insérée
  });
};

// Ajouter les détails de vente
const addVenteDetails = (details, callback) => {
  const { vente_id, produit_id, quantite, prix_unitaire, total } = details;

  const query = `
    INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [vente_id, produit_id, quantite, prix_unitaire, total],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID); // Retourne l'ID du détail inséré
    }
  );
};

// Obtenir toutes les ventes
const getAllVentes = (callback) => {
  const query = `SELECT * FROM ventes`;
  db.all(query, [], callback);
};

// Obtenir une vente spécifique
const getVenteById = (id, callback) => {
  const query = `SELECT * FROM ventes WHERE id = ?`;
  db.get(query, [id], callback);
};

// Obtenir les détails d'une vente spécifique
const getVenteDetails = (venteId, callback) => {
  const query = `
    SELECT * FROM ventes_details WHERE vente_id = ?
  `;
  db.all(query, [venteId], callback);
};

module.exports = {
  addVente,
  addVenteDetails,
  getAllVentes,
  getVenteById,
  getVenteDetails,
};
