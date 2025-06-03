const db = require('../config/db');
const moment = require('moment');

function formatDateForSQL(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      const { startDate, endDate, period = 'month', categoryId, zone } = req.query;

      // Dates par défaut : dernier mois
      const start = startDate || moment().subtract(1, 'month').startOf('day').format('YYYY-MM-DD');
      const end = endDate || moment().endOf('day').format('YYYY-MM-DD');

      // 1. Evolution ventes et achats dans le temps
      // Groupement dynamique selon period (day/week/month/quarter)
      // SQLite n’a pas toutes les fonctions SQL pour grouper par semaine/trimestre donc on adapte
      const periodFormat = {
        day: "%Y-%m-%d",
        week: "%Y-%W",
        month: "%Y-%m",
        quarter: "%Y-Q" // on gère en code
      };

      // Fonction helper pour groupe trimestre
      function getQuarterGroup(field) {
        return `
          (strftime('%Y', ${field}) || '-Q' || ((cast(strftime('%m', ${field}) as integer) - 1) / 3 + 1))
        `;
      }

      // Evolution des ventes
      let ventesQuery = `
        SELECT 
          CASE 
            WHEN ? = 'quarter' THEN ${getQuarterGroup('date_vente')}
            ELSE strftime(?, date_vente)
          END AS periode,
          SUM(total) as total_ventes
        FROM ventes
        WHERE date_vente BETWEEN ? AND ?
      `;

      // Evolution des achats
      let achatsQuery = `
        SELECT 
          CASE 
            WHEN ? = 'quarter' THEN ${getQuarterGroup('date_achat')}
            ELSE strftime(?, date_achat)
          END AS periode,
          SUM(total) as total_achats
        FROM achats
        WHERE date_achat BETWEEN ? AND ?
      `;

      // Si filtre catégorie, on doit joindre les produits + ventes_details ou achats_details
      let ventesByCategoryQuery = `
        SELECT c.nom as categorie, SUM(vd.quantite * vd.prix_unitaire) as total_ventes
        FROM ventes v
        JOIN ventes_details vd ON vd.vente_id = v.id
        JOIN produits p ON p.id = vd.produit_id
        JOIN categories c ON c.id = p.categorie_id
        WHERE v.date_vente BETWEEN ? AND ?
      `;

      let achatsByCategoryQuery = `
        SELECT c.nom as categorie, SUM(ad.quantite * ad.prix_unitaire) as total_achats
        FROM achats a
        JOIN achats_details ad ON ad.achat_id = a.id
        JOIN produits p ON p.id = ad.produit_id
        JOIN categories c ON c.id = p.categorie_id
        WHERE a.date_achat BETWEEN ? AND ?
      `;

      // Filtrer par catégorie si fourni
      if (categoryId) {
        ventesByCategoryQuery += " AND c.id = ? ";
        achatsByCategoryQuery += " AND c.id = ? ";
      }

      ventesByCategoryQuery += " GROUP BY c.nom";
      achatsByCategoryQuery += " GROUP BY c.nom";

      // 3. Produits les plus vendus / achetés
      let topVentesQuery = `
        SELECT p.nom, SUM(vd.quantite) as quantite_vendue
        FROM ventes_details vd
        JOIN produits p ON p.id = vd.produit_id
        JOIN ventes v ON v.id = vd.vente_id
        WHERE v.date_vente BETWEEN ? AND ?
        GROUP BY p.nom
        ORDER BY quantite_vendue DESC
        LIMIT 10
      `;

      let topAchatsQuery = `
        SELECT p.nom, SUM(ad.quantite) as quantite_achetee
        FROM achats_details ad
        JOIN produits p ON p.id = ad.produit_id
        JOIN achats a ON a.id = ad.achat_id
        WHERE a.date_achat BETWEEN ? AND ?
        GROUP BY p.nom
        ORDER BY quantite_achetee DESC
        LIMIT 10
      `;

      // 4. Comportement client : fréquence (nombre d’achats), panier moyen, récurrence
      let comportementClientQuery = `
        SELECT
          c.id,
          c.nom,
          COUNT(v.id) as nombre_achats,
          AVG(v.total) as panier_moyen,
          MAX(v.date_vente) as dernier_achat
        FROM clients c
        LEFT JOIN ventes v ON v.client_id = c.id AND v.date_vente BETWEEN ? AND ?
        GROUP BY c.id, c.nom
        ORDER BY nombre_achats DESC
        LIMIT 10
      `;

      // 5. Marges bénéficiaires par produit (vente - achat)
      let margesProduitQuery = `
        SELECT p.nom,
          SUM(vd.quantite * vd.prix_unitaire) as total_ventes,
          COALESCE(SUM(ad.quantite * ad.prix_unitaire), 0) as total_achats,
          (SUM(vd.quantite * vd.prix_unitaire) - COALESCE(SUM(ad.quantite * ad.prix_unitaire), 0)) as marge
        FROM produits p
        LEFT JOIN ventes_details vd ON vd.produit_id = p.id
        LEFT JOIN ventes v ON v.id = vd.vente_id AND v.date_vente BETWEEN ? AND ?
        LEFT JOIN achats_details ad ON ad.produit_id = p.id
        LEFT JOIN achats a ON a.id = ad.achat_id AND a.date_achat BETWEEN ? AND ?
        GROUP BY p.nom
        ORDER BY marge DESC
        LIMIT 10
      `;

      // Exécution des requêtes
      const ventesEvolution = await new Promise((resolve, reject) => {
        db.all(ventesQuery, [period, periodFormat[period], start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const achatsEvolution = await new Promise((resolve, reject) => {
        db.all(achatsQuery, [period, periodFormat[period], start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const ventesByCategory = await new Promise((resolve, reject) => {
        const params = categoryId ? [start, end, categoryId] : [start, end];
        db.all(ventesByCategoryQuery, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const achatsByCategory = await new Promise((resolve, reject) => {
        const params = categoryId ? [start, end, categoryId] : [start, end];
        db.all(achatsByCategoryQuery, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const topVentes = await new Promise((resolve, reject) => {
        db.all(topVentesQuery, [start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const topAchats = await new Promise((resolve, reject) => {
        db.all(topAchatsQuery, [start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const comportementClient = await new Promise((resolve, reject) => {
        db.all(comportementClientQuery, [start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const margesProduit = await new Promise((resolve, reject) => {
        db.all(margesProduitQuery, [start, end, start, end], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Insights/actionnables simples (exemple : évolution % des ventes entre deux périodes)
      // (à améliorer selon besoin)

      // Construction de la réponse
      const data = {
        evolution: { ventes: ventesEvolution, achats: achatsEvolution },
        byCategory: { ventes: ventesByCategory, achats: achatsByCategory },
        topProduits: { ventes: topVentes, achats: topAchats },
        comportementClient,
        margesProduit,
      };

      res.json({ success: true, data });
    } catch (error) {
      console.error('Erreur dashboard:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
};

module.exports = dashboardController;
