const db = require("../config/db");

// Récupérer toutes les catégories
exports.getCategories = (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des catégories",
        error: err,
      });
    }
    res.status(200).json(rows);
  });
};

// Récupérer une catégorie par son id
exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération de la catégorie",
        error: err,
      });
    }
    if (!row) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(row);
  });
};

// Créer une nouvelle catégorie
exports.createCategory = (req, res) => {
  const { nom, description } = req.body;

  if (!nom) {
    return res.status(400).json({ message: "Le champ nom est obligatoire." });
  }

  // Vérifier si le nom existe déjà
  const checkQuery = "SELECT COUNT(*) AS count FROM categories WHERE nom = ?";
  db.get(checkQuery, [nom], (err, row) => {
    if (err) {
      console.error("Erreur lors de la vérification du nom:", err);
      return res.status(500).json({
        message: "Erreur lors de la vérification du nom",
        error: err,
      });
    }

    if (row.count > 0) {
      return res.status(400).json({
        message: "Le nom de la catégorie est déjà utilisé.",
      });
    }

    // Si nom unique, on insère
    const insertQuery = "INSERT INTO categories (nom, description) VALUES (?, ?)";
    db.run(insertQuery, [nom, description], function (err) {
      if (err) {
        console.error("Erreur lors de la création de la catégorie:", err);
        return res.status(500).json({
          message: "Erreur lors de la création de la catégorie",
          error: err,
        });
      }

      res.status(201).json({ id: this.lastID, nom, description });
    });
  });
};


// Mettre à jour une catégorie
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { nom, description } = req.body;

  const query = "UPDATE categories SET nom = ?, description = ? WHERE id = ?";

  db.run(query, [nom, description, id], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour de la catégorie",
        error: err,
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json({ id, nom, description });
  });
};

// Supprimer une catégorie
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM categories WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la suppression de la catégorie",
        error: err,
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  });
};
