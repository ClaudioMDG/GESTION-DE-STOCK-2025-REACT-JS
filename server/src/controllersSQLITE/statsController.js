const db = require("../config/db");

exports.getStats = (req, res) => {
  const stats = {};

  db.serialize(() => {
    db.get("SELECT COUNT(*) AS total FROM clients", (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalClients = row.total;

      db.get("SELECT COUNT(*) AS total FROM produits", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalProduits = row.total;

        db.get("SELECT COUNT(*) AS total FROM ventes", (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.totalVentes = row.total;

          db.get("SELECT COUNT(*) AS total FROM achats", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalAchats = row.total;

            db.get(
              "SELECT SUM(total) AS totalVenteValue FROM ventes",
              (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.totalVenteValue = row.totalVenteValue || 0;

                db.get(
                  "SELECT SUM(total) AS totalAchatValue FROM achats",
                  (err, row) => {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    stats.totalAchatValue = row.totalAchatValue || 0;

                    db.all(
                      `
                  SELECT nom, quantite_en_stock, seuil_alerte 
                  FROM produits 
                  WHERE quantite_en_stock <= seuil_alerte
                `,
                      (err, rows) => {
                        if (err)
                          return res.status(500).json({ error: err.message });
                        stats.produitsFaibles = rows;

                        db.all(
                          `
                    SELECT p.nom, SUM(vd.quantite) AS total_vendu
                    FROM ventes_details vd
                    JOIN produits p ON p.id = vd.produit_id
                    GROUP BY vd.produit_id
                    ORDER BY total_vendu DESC
                    LIMIT 5
                  `,
                          (err, rows) => {
                            if (err)
                              return res
                                .status(500)
                                .json({ error: err.message });
                            stats.topProduits = rows;

                            res.json(stats);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  });
};
