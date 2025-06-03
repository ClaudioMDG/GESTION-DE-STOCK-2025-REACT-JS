// const db = require("../config/db");
const { updateStock } = require("./produitController");
const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL // adapte cette ligne selon ton environnement
});
// Créer un achat
exports.createAchat = async (req, res) => {
  const { fournisseur_id, total, date_achat, utilisateur_id, produits } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const insertAchat = `
      INSERT INTO achats (fournisseur_id, date_achat, total, utilisateur_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const achatResult = await client.query(insertAchat, [fournisseur_id, date_achat, total, utilisateur_id]);
    const achat_id = achatResult.rows[0].id;

    for (const p of produits) {
      const insertDetail = `
        INSERT INTO achats_details (achat_id, produit_id, quantite, prix_unitaire, total)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertDetail, [achat_id, p.produit_id, p.quantite, p.prix_unitaire, p.total]);

      await new Promise((resolve, reject) => {
        updateStock(p.produit_id, p.quantite, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Achat ajouté avec succès", achat_id });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      error: "Erreur lors de l'ajout de l'achat ou de ses détails",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// Récupérer tous les achats
exports.getAllAchats = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM achats");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des achats" });
  }
};

// Récupérer un achat par ID
exports.getAchatById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM achats WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Achat non trouvé" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'achat" });
  }
};

// Supprimer un achat
exports.deleteAchat = async (req, res) => {
  const { id } = req.params;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM achats_details WHERE achat_id = $1", [id]);
    const result = await client.query("DELETE FROM achats WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Achat non trouvé" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Achat supprimé avec succès" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Erreur lors de la suppression de l'achat" });
  } finally {
    client.release();
  }
};
