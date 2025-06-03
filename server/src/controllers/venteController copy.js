
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

    // Vérifier stocks
    for (const prod of produits) {
      if (prod.quantite <= 0) {
        throw new Error(`Quantité invalide pour le produit ID ${prod.produit_id}`);
      }

      const { rows } = await client.query(
        "SELECT quantite_en_stock FROM produits WHERE id = $1",
        [prod.produit_id]
      );
      if (rows.length === 0) {
        throw new Error(`Produit ID ${prod.produit_id} introuvable.`);
      }
      if (rows[0].quantite_en_stock < prod.quantite) {
        throw new Error(
          `Stock insuffisant pour le produit ID ${prod.produit_id}. En stock: ${rows[0].quantite_en_stock}, demandé: ${prod.quantite}`
        );
      }
    }

    // Insérer la vente
    const insertVente = `
      INSERT INTO ventes (client_id, date_vente, total, utilisateur_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await client.query(insertVente, [client_id, date_vente, total, utilisateur_id]);
    const venteId = result.rows[0].id;

    // Insérer détails et mettre à jour stock
    for (const prod of produits) {
      const totalProduit = prod.quantite * prod.prix_unitaire;

      const insertDetail = `
        INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertDetail, [venteId, prod.produit_id, prod.quantite, prod.prix_unitaire, totalProduit]);

      await updateStock(prod.produit_id, -prod.quantite); // Supposé retourner une Promise
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Vente créée avec succès", venteId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(err.message.includes("Stock") ? 400 : 500).json({
      message: err.message.includes("Stock") ? "Vente refusée" : "Erreur lors de la création de la vente",
      error: err.message,
    });
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
    res.status(500).json({
      message: "Erreur lors de la récupération des ventes",
      error: err.message,
    });
  }
};

// Récupérer une vente par ID
exports.getVenteById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query("SELECT * FROM ventes WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vente non trouvée" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la vente",
      error: err.message,
    });
  }
};

// Supprimer une vente
exports.deleteVente = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const detailsRes = await client.query("SELECT * FROM ventes_details WHERE vente_id = $1", [id]);

    if (detailsRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Aucun détail trouvé pour cette vente" });
    }

    // Restaurer le stock pour chaque produit
    for (const detail of detailsRes.rows) {
      await updateStock(detail.produit_id, detail.quantite);
    }

    // Supprimer les détails
    await client.query("DELETE FROM ventes_details WHERE vente_id = $1", [id]);

    // Supprimer la vente
    const delVenteRes = await client.query("DELETE FROM ventes WHERE id = $1", [id]);

    if (delVenteRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vente non trouvée" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Vente supprimée avec succès" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de la suppression de la vente",
      error: err.message,
    });
  } finally {
    client.release();
  }
};
