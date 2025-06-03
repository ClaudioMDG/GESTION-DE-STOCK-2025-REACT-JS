// fournisseurController.js
const db = require("../config/db"); // Assurez-vous que votre config db est correcte

exports.ajouterFournisseur = (req, res) => {
  const { nom, email, telephone, adresse } = req.body;

  if (!nom || !email || !telephone || !adresse) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  const query = `INSERT INTO fournisseurs (nom, email, telephone, adresse) 
                 VALUES (?, ?, ?, ?)`;

  db.run(query, [nom, email, telephone, adresse], function (err) {
    if (err) {
      console.error("Erreur lors de l'ajout du fournisseur:", err);

      // Gestion des erreurs de contrainte UNIQUE
      if (err.code === "SQLITE_CONSTRAINT") {
        let field = "";

        if (err.message.includes("nom")) field = "nom";
        else if (err.message.includes("email")) field = "email";
        else if (err.message.includes("telephone")) field = "téléphone";

        return res.status(400).json({
          message: `Le champ ${field} est déjà utilisé.`,
        });
      }

      // Erreur inconnue
      return res.status(500).json({ message: "Erreur lors de l'ajout du fournisseur" });
    }

    res.status(201).json({
      message: "Fournisseur ajouté avec succès",
      fournisseur: { id: this.lastID, nom, email, telephone, adresse },
    });
  });
};

// Récupérer tous les fournisseurs
exports.getAllFournisseurs = (req, res) => {
  const query = `SELECT * FROM fournisseurs`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des fournisseurs:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des fournisseurs" });
    }
    res.status(200).json(rows);
  });
};

// Récupérer un fournisseur par ID
exports.getFournisseurById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM fournisseurs WHERE id = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Erreur lors de la récupération du fournisseur:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du fournisseur" });
    }
    if (!row) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.status(200).json(row);
  });
};

// Mettre à jour un fournisseur
exports.updateFournisseur = (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse } = req.body;

  const query = `UPDATE fournisseurs SET nom = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?`;

  db.run(query, [nom, email, telephone, adresse, id], function (err) {
    if (err) {
      console.error("Erreur lors de la mise à jour du fournisseur:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du fournisseur" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.status(200).json({ message: "Fournisseur mis à jour avec succès" });
  });
};

// Supprimer un fournisseur
exports.deleteFournisseur = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM fournisseurs WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error("Erreur lors de la suppression du fournisseur:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression du fournisseur" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.status(200).json({ message: "Fournisseur supprimé avec succès" });
  });
};
