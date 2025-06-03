const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL // adapte cette ligne selon ton environnement
});
// Récupérer tous les clients
const getAllClients = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clients ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer un client par ID
const getClientById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer un client
const createClient = async (req, res) => {
  const { nom, email, telephone, adresse } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO clients (nom, email, telephone, adresse) VALUES ($1, $2, $3, $4) RETURNING id`,
      [nom, email, telephone, adresse]
    );
    res.status(201).json({ id: result.rows[0].id, nom, email, telephone, adresse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour un client
const updateClient = async (req, res) => {
  const id = req.params.id;
  const { nom, email, telephone, adresse } = req.body;

  try {
    const result = await db.query(
      `UPDATE clients SET nom = $1, email = $2, telephone = $3, adresse = $4 WHERE id = $5`,
      [nom, email, telephone, adresse, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    res.json({ message: "Client mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un client
const deleteClient = async (req, res) => {
  const id = req.params.id;

  try {
    const checkResult = await db.query(`SELECT COUNT(*) FROM ventes WHERE client_id = $1`, [id]);
    const count = parseInt(checkResult.rows[0].count, 10);

    if (count > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer ce client car il est lié à une ou plusieurs ventes.",
      });
    }

    const deleteResult = await db.query(`DELETE FROM clients WHERE id = $1`, [id]);
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    res.json({ message: "Client supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
