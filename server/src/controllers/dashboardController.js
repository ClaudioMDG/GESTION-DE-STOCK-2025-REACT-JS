const { Pool } = require('pg');
const moment = require('moment');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // à adapter à ton environnement
});

function formatDateForSQL(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      const { startDate, endDate, period = 'month', categoryId } = req.query;

      const start = startDate || moment().subtract(1, 'month').startOf('day').format('YYYY-MM-DD');
      const end = endDate || moment().endOf('day').format('YYYY-MM-DD');

      const periodFormat = {
        day: "YYYY-MM-DD",
        week: "IYYY-IW",
        month: "YYYY-MM",
        quarter: null // gestion à part
      };

      const client = await pool.connect();

      function getPeriodField(field) {
        if (period === 'quarter') {
          return `EXTRACT(YEAR FROM ${field}) || '-Q' || EXTRACT(QUARTER FROM ${field})`;
        } else {
          return `TO_CHAR(${field}, '${periodFormat[period]}')`;
        }
      }

      // Requêtes
      const ventesQuery = `
        SELECT ${getPeriodField('date_vente')} AS periode,
               SUM(total) AS total_ventes
        FROM ventes
        WHERE date_vente BETWEEN $1 AND $2
        GROUP BY periode
        ORDER BY periode
      `;

      const achatsQuery = `
        SELECT ${getPeriodField('date_achat')} AS periode,
               SUM(total) AS total_achats
        FROM achats
        WHERE date_achat BETWEEN $1 AND $2
        GROUP BY periode
        ORDER BY periode
      `;

      let ventesByCategoryQuery = `
        SELECT c.nom AS categorie,
               SUM(vd.quantite * vd.prix_unitaire) AS total_ventes
        FROM ventes v
        JOIN ventes_details vd ON vd.vente_id = v.id
        JOIN produits p ON p.id = vd.produit_id
        JOIN categories c ON c.id = p.categorie_id
        WHERE v.date_vente BETWEEN $1 AND $2
      `;

      let achatsByCategoryQuery = `
        SELECT c.nom AS categorie,
               SUM(ad.quantite * ad.prix_unitaire) AS total_achats
        FROM achats a
        JOIN achats_details ad ON ad.achat_id = a.id
        JOIN produits p ON p.id = ad.produit_id
        JOIN categories c ON c.id = p.categorie_id
        WHERE a.date_achat BETWEEN $1 AND $2
      `;

      const paramsCat = [start, end];
      if (categoryId) {
        ventesByCategoryQuery += ` AND c.id = $3`;
        achatsByCategoryQuery += ` AND c.id = $3`;
        paramsCat.push(categoryId);
      }
      ventesByCategoryQuery += ` GROUP BY c.nom`;
      achatsByCategoryQuery += ` GROUP BY c.nom`;

      const topVentesQuery = `
        SELECT p.nom,
               SUM(vd.quantite) AS quantite_vendue
        FROM ventes_details vd
        JOIN produits p ON p.id = vd.produit_id
        JOIN ventes v ON v.id = vd.vente_id
        WHERE v.date_vente BETWEEN $1 AND $2
        GROUP BY p.nom
        ORDER BY quantite_vendue DESC
        LIMIT 10
      `;

      const topAchatsQuery = `
        SELECT p.nom,
               SUM(ad.quantite) AS quantite_achetee
        FROM achats_details ad
        JOIN produits p ON p.id = ad.produit_id
        JOIN achats a ON a.id = ad.achat_id
        WHERE a.date_achat BETWEEN $1 AND $2
        GROUP BY p.nom
        ORDER BY quantite_achetee DESC
        LIMIT 10
      `;

      const comportementClientQuery = `
        SELECT c.id,
               c.nom,
               COUNT(v.id) AS nombre_achats,
               AVG(v.total) AS panier_moyen,
               MAX(v.date_vente) AS dernier_achat
        FROM clients c
        LEFT JOIN ventes v ON v.client_id = c.id AND v.date_vente BETWEEN $1 AND $2
        GROUP BY c.id, c.nom
        ORDER BY nombre_achats DESC
        LIMIT 10
      `;

      const margesProduitQuery = `
        SELECT p.nom,
               SUM(vd.quantite * vd.prix_unitaire) AS total_ventes,
               COALESCE(SUM(ad.quantite * ad.prix_unitaire), 0) AS total_achats,
               SUM(vd.quantite * vd.prix_unitaire) - COALESCE(SUM(ad.quantite * ad.prix_unitaire), 0) AS marge
        FROM produits p
        LEFT JOIN ventes_details vd ON vd.produit_id = p.id
        LEFT JOIN ventes v ON v.id = vd.vente_id AND v.date_vente BETWEEN $1 AND $2
        LEFT JOIN achats_details ad ON ad.produit_id = p.id
        LEFT JOIN achats a ON a.id = ad.achat_id AND a.date_achat BETWEEN $1 AND $2
        GROUP BY p.nom
        ORDER BY marge DESC
        LIMIT 10
      `;

      // Exécution
      const [
        ventesEvolution,
        achatsEvolution,
        ventesByCategory,
        achatsByCategory,
        topVentes,
        topAchats,
        comportementClient,
        margesProduit
      ] = await Promise.all([
        client.query(ventesQuery, [start, end]),
        client.query(achatsQuery, [start, end]),
        client.query(ventesByCategoryQuery, paramsCat),
        client.query(achatsByCategoryQuery, paramsCat),
        client.query(topVentesQuery, [start, end]),
        client.query(topAchatsQuery, [start, end]),
        client.query(comportementClientQuery, [start, end]),
        client.query(margesProduitQuery, [start, end])
      ]);

      client.release();

      res.json({
        success: true,
        data: {
          evolution: {
            ventes: ventesEvolution.rows,
            achats: achatsEvolution.rows
          },
          byCategory: {
            ventes: ventesByCategory.rows,
            achats: achatsByCategory.rows
          },
          topProduits: {
            ventes: topVentes.rows,
            achats: topAchats.rows
          },
          comportementClient: comportementClient.rows,
          margesProduit: margesProduit.rows
        }
      });
    } catch (error) {
      console.error('Erreur dashboard:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
};

module.exports = dashboardController;
