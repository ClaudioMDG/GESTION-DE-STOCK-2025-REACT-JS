const db = require("../config/db");
const bcrypt = require("bcrypt");

// Fonction pour récupérer tous les utilisateurs
const getAllUsers = (req, res) => {
  const query = "SELECT * FROM utilisateurs";
  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erreur de récupération des utilisateurs:", err); // Log de l'erreur
      res.status(500).json({
        message: "Erreur de récupération des utilisateurs",
        error: err,
      });
    } else {
      res.status(200).json(rows);
    }
  });
};

const addUser = async (req, res) => {
  const { nom, email, mot_de_passe, role } = req.body;

  try {
    // Vérifier si nom ou email existe déjà
    const checkQuery = `SELECT * FROM utilisateurs WHERE nom = ? OR email = ?`;
    db.get(checkQuery, [nom, email], async (err, row) => {
      if (err) {
        console.error("Erreur lors de la vérification de l'utilisateur:", err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
      }

      if (row) {
        // Si on trouve un utilisateur avec même nom ou email
        if (row.nom === nom) {
          return res.status(400).json({ message: "Le nom est déjà utilisé." });
        }
        if (row.email === email) {
          return res.status(400).json({ message: "L'email est déjà utilisé." });
        }
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // Insertion utilisateur
      const insertQuery = `INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)`;
      db.run(insertQuery, [nom, email, hashedPassword, role], function (err) {
        if (err) {
          console.error("Erreur lors de l'ajout de l'utilisateur:", err);
          return res.status(500).json({
            message: "Erreur lors de l'ajout de l'utilisateur",
            error: err,
          });
        }
        res.status(201).json({ message: "Utilisateur ajouté avec succès", id: this.lastID });
      });
    });
  } catch (err) {
    console.error("Erreur lors du hachage du mot de passe:", err);
    res.status(500).json({ message: "Erreur lors du hachage du mot de passe", error: err });
  }
};


// Fonction pour récupérer un utilisateur par ID
const getUserById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM utilisateurs WHERE id = ?";

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Erreur de récupération de l'utilisateur:", err); // Log de l'erreur
      res.status(500).json({
        message: "Erreur de récupération de l'utilisateur",
        error: err,
      });
    } else if (!row) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      res.status(200).json(row);
    }
  });
};

// Fonction pour mettre à jour un utilisateur
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, email, mot_de_passe, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10); // 🔐 hachage

    const query = `UPDATE utilisateurs SET nom = ?, email = ?, mot_de_passe = ?, role = ? WHERE id = ?`;

    db.run(query, [nom, email, hashedPassword, role, id], function (err) {
      if (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", err); // Log de l'erreur
        res.status(500).json({
          message: "Erreur lors de la mise à jour de l'utilisateur",
          error: err,
        });
      } else {
        res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
      }
    });
  } catch (err) {
    console.error("Erreur lors du hachage du mot de passe:", err); // Log de l'erreur
    res
      .status(500)
      .json({ message: "Erreur lors du hachage du mot de passe", error: err });
  }
};

// Fonction pour supprimer un utilisateur
const deleteUser = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM utilisateurs WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err); // Log de l'erreur
      res.status(500).json({
        message: "Erreur lors de la suppression de l'utilisateur",
        error: err,
      });
    } else {
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    }
  });
};

module.exports = {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser,
};
