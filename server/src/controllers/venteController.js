
const { updateStock } = require("./produitController");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // adapte selon ton environnement
});

// Créer une nouvelle vente
exports.createVente = async (req, res) => {
  const { client_id, total, date_vente, utilisateur_id, produits } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insérer la vente
    const insertVenteText = `
      INSERT INTO ventes (client_id, date_vente, total, utilisateur_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const { rows } = await client.query(insertVenteText, [client_id, date_vente, total, utilisateur_id]);
    const venteId = rows[0].id;

    // Préparer insertion détails
    const insertDetailsText = `
      INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // Insérer chaque détail et mettre à jour le stock
    for (const prod of produits) {
      const totalProduit = prod.quantite * prod.prix_unitaire;

      await client.query(insertDetailsText, [
        venteId,
        prod.produit_id,
        prod.quantite,
        prod.prix_unitaire,
        totalProduit,
      ]);

      // Mettre à jour le stock (updateStock doit retourner une Promise)
      await updateStock(prod.produit_id, -prod.quantite);
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Vente créée avec succès", venteId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Erreur lors de la création de la vente", error: err.message });
  } finally {
    client.release();
  }
};

// Récupérer toutes les ventes
exports.getAllVentes = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM ventes");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des ventes", error: err.message });
  }
};

// Récupérer une vente par son ID
exports.getVenteById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query("SELECT * FROM ventes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Vente non trouvée" });

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de la vente", error: err.message });
  }
};

// Supprimer une vente
exports.deleteVente = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Récupérer les détails pour restaurer le stock
    const { rows: details } = await client.query("SELECT * FROM ventes_details WHERE vente_id = $1", [id]);

    if (details.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Aucun détail trouvé pour cette vente" });
    }

    // Restaurer le stock produit par produit
    for (const detail of details) {
      await updateStock(detail.produit_id, detail.quantite);
    }

    // Supprimer les détails
    await client.query("DELETE FROM ventes_details WHERE vente_id = $1", [id]);

    // Supprimer la vente
    const deleteVenteRes = await client.query("DELETE FROM ventes WHERE id = $1", [id]);

    if (deleteVenteRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vente non trouvée" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Vente supprimée avec succès" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Erreur lors de la suppression de la vente", error: err.message });
  } finally {
    client.release();
  }
};
