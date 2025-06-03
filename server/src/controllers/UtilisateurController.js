const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // adapte selon ton environnement
});
const bcrypt = require("bcrypt");

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM utilisateurs");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Erreur de récupération des utilisateurs:", err);
    res.status(500).json({
      message: "Erreur de récupération des utilisateurs",
      error: err.message,
    });
  }
};

// Ajouter un utilisateur
const addUser = async (req, res) => {
  const { nom, email, mot_de_passe, role } = req.body;

  try {
    // Vérifier si nom ou email existe déjà
    const checkRes = await pool.query(
      `SELECT * FROM utilisateurs WHERE nom = $1 OR email = $2`,
      [nom, email]
    );

    if (checkRes.rows.length > 0) {
      const existingUser = checkRes.rows[0];
      if (existingUser.nom === nom) {
        return res.status(400).json({ message: "Le nom est déjà utilisé." });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "L'email est déjà utilisé." });
      }
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Insertion utilisateur
    const insertQuery = `
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const insertRes = await pool.query(insertQuery, [nom, email, hashedPassword, role]);

    res.status(201).json({
      message: "Utilisateur ajouté avec succès",
      id: insertRes.rows[0].id,
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", err);
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'utilisateur",
      error: err.message,
    });
  }
};

// Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE id = $1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Erreur de récupération de l'utilisateur:", err);
    res.status(500).json({
      message: "Erreur de récupération de l'utilisateur",
      error: err.message,
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, email, mot_de_passe, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const updateQuery = `
      UPDATE utilisateurs
      SET nom = $1, email = $2, mot_de_passe = $3, role = $4
      WHERE id = $5
      RETURNING id
    `;
    const result = await pool.query(updateQuery, [nom, email, hashedPassword, role, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error: err.message,
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM utilisateurs WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur:", err);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur",
      error: err.message,
    });
  }
};

module.exports = {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser,
};
