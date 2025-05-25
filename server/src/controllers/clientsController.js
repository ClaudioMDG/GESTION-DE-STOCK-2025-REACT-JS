const db = require("../config/db");

// Récupérer tous les clients
const getAllClients = (req, res) => {
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
};

// Récupérer un client par ID
const getClientById = (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM clients WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: "Client non trouvé" });
    res.json(row);
  });
};

// Créer un client
const createClient = (req, res) => {
  const { nom, email, telephone, adresse } = req.body;
  db.run(
    `INSERT INTO clients (nom, email, telephone, adresse) VALUES (?, ?, ?, ?)`,
    [nom, email, telephone, adresse],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ id: this.lastID, nom, email, telephone, adresse });
    }
  );
};

// Mettre à jour un client
const updateClient = (req, res) => {
  const id = req.params.id;
  const { nom, email, telephone, adresse } = req.body;
  db.run(
    `UPDATE clients SET nom = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?`,
    [nom, email, telephone, adresse, id],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: "Client non trouvé" });
      res.json({ message: "Client mis à jour avec succès" });
    }
  );
};

const deleteClient = (req, res) => {
  const id = req.params.id;

  // Vérifier s'il y a des ventes liées au client
  const checkQuery = `SELECT COUNT(*) AS count FROM ventes WHERE client_id = ?`;
  db.get(checkQuery, [id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });

    if (row.count > 0) {
      // Il y a au moins une vente liée => interdit de supprimer
      return res.status(400).json({ message: "Impossible de supprimer ce client car il est lié à une ou plusieurs ventes." });
    }

    // Sinon on peut supprimer le client
    db.run(`DELETE FROM clients WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ message: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: "Client non trouvé" });
      res.json({ message: "Client supprimé avec succès" });
    });
  });
};


module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
