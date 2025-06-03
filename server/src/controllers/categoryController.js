const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL // adapte cette ligne selon ton environnement
});
// Récupérer toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories",
      error: err.message,
    });
  }
};

// Récupérer une catégorie par son id
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la catégorie",
      error: err.message,
    });
  }
};

// Créer une nouvelle catégorie
exports.createCategory = async (req, res) => {
  const { nom, description } = req.body;

  if (!nom) {
    return res.status(400).json({ message: "Le champ nom est obligatoire." });
  }

  try {
    const checkResult = await db.query("SELECT COUNT(*) FROM categories WHERE nom = $1", [nom]);

    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({
        message: "Le nom de la catégorie est déjà utilisé.",
      });
    }

    const insertResult = await db.query(
      "INSERT INTO categories (nom, description) VALUES ($1, $2) RETURNING id",
      [nom, description]
    );

    res.status(201).json({ id: insertResult.rows[0].id, nom, description });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création de la catégorie",
      error: err.message,
    });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { nom, description } = req.body;

  try {
    const result = await db.query(
      "UPDATE categories SET nom = $1, description = $2 WHERE id = $3",
      [nom, description, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.status(200).json({ id, nom, description });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la catégorie",
      error: err.message,
    });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM categories WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la catégorie",
      error: err.message,
    });
  }
};
