const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL // adapte cette ligne selon ton environnement
});

// ➕ Ajouter un fournisseur
exports.ajouterFournisseur = async (req, res) => {
  const { nom, email, telephone, adresse } = req.body;

  if (!nom || !email || !telephone || !adresse) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO fournisseurs (nom, email, telephone, adresse)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [nom, email, telephone, adresse]
    );

    res.status(201).json({
      message: "Fournisseur ajouté avec succès",
      fournisseur: {
        id: result.rows[0].id,
        nom,
        email,
        telephone,
        adresse,
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout du fournisseur:", err);

    if (err.code === "23505") {
      // 23505 = PostgreSQL unique_violation
      let field = "";
      if (err.constraint.includes("nom")) field = "nom";
      else if (err.constraint.includes("email")) field = "email";
      else if (err.constraint.includes("telephone")) field = "téléphone";

      return res.status(400).json({
        message: `Le champ ${field} est déjà utilisé.`,
      });
    }

    res.status(500).json({ message: "Erreur lors de l'ajout du fournisseur" });
  }
};

// 📋 Récupérer tous les fournisseurs
exports.getAllFournisseurs = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM fournisseurs`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des fournisseurs:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des fournisseurs" });
  }
};

// 🔍 Récupérer un fournisseur par ID
exports.getFournisseurById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM fournisseurs WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du fournisseur:", err);
    res.status(500).json({ message: "Erreur lors de la récupération du fournisseur" });
  }
};

// ✏️ Mettre à jour un fournisseur
exports.updateFournisseur = async (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE fournisseurs
      SET nom = $1, email = $2, telephone = $3, adresse = $4
      WHERE id = $5
      `,
      [nom, email, telephone, adresse, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    res.status(200).json({ message: "Fournisseur mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du fournisseur:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du fournisseur" });
  }
};

// 🗑️ Supprimer un fournisseur
exports.deleteFournisseur = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM fournisseurs WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    res.status(200).json({ message: "Fournisseur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du fournisseur:", err);
    res.status(500).json({ message: "Erreur lors de la suppression du fournisseur" });
  }
};
