const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.getStats = async (req, res) => {
  try {
    const stats = {};

    // Total clients
    const totalClientsResult = await pool.query("SELECT COUNT(*) AS total FROM clients");
    stats.totalClients = parseInt(totalClientsResult.rows[0].total, 10);

    // Total produits
    const totalProduitsResult = await pool.query("SELECT COUNT(*) AS total FROM produits");
    stats.totalProduits = parseInt(totalProduitsResult.rows[0].total, 10);

    // Total ventes
    const totalVentesResult = await pool.query("SELECT COUNT(*) AS total FROM ventes");
    stats.totalVentes = parseInt(totalVentesResult.rows[0].total, 10);

    // Total achats
    const totalAchatsResult = await pool.query("SELECT COUNT(*) AS total FROM achats");
    stats.totalAchats = parseInt(totalAchatsResult.rows[0].total, 10);

    // Somme totale des ventes
    const totalVenteValueResult = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalVenteValue FROM ventes");
    stats.totalVenteValue = parseFloat(totalVenteValueResult.rows[0].totalventevalue);

    // Somme totale des achats
    const totalAchatValueResult = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalAchatValue FROM achats");
    stats.totalAchatValue = parseFloat(totalAchatValueResult.rows[0].totalachatvalue);

    // Produits avec stock faible (<= seuil_alerte)
    const produitsFaiblesResult = await pool.query(`
      SELECT nom, quantite_en_stock, seuil_alerte 
      FROM produits 
      WHERE quantite_en_stock <= seuil_alerte
    `);
    stats.produitsFaibles = produitsFaiblesResult.rows;

    // Top 5 des produits les plus vendus
    const topProduitsResult = await pool.query(`
      SELECT p.nom, SUM(vd.quantite) AS total_vendu
      FROM ventes_details vd
      JOIN produits p ON p.id = vd.produit_id
      GROUP BY vd.produit_id, p.nom
      ORDER BY total_vendu DESC
      LIMIT 5
    `);
    stats.topProduits = topProduitsResult.rows;

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
