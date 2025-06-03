const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL // à adapter si besoin
});

// Ajouter les détails d'une vente
exports.addDetailsVente = async (req, res) => {
  const { vente_id, produit_id, quantite, prix_unitaire } = req.body;

  if (!vente_id || !produit_id || !quantite || !prix_unitaire) {
    return res.status(400).json({ message: "Données manquantes ou invalides" });
  }

  const total = quantite * prix_unitaire;

  try {
    const result = await pool.query(
      `
      INSERT INTO ventes_details (vente_id, produit_id, quantite, prix_unitaire, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [vente_id, produit_id, quantite, prix_unitaire, total]
    );

    res.status(201).json({
      message: "Détail de vente ajouté avec succès",
      detailId: result.rows[0].id
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout du détail de la vente :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// Récupérer les détails d'une vente avec le nom du produit
exports.getDetailsByVenteId = async (req, res) => {
  const { vente_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        vd.*, 
        p.nom AS produit_nom 
      FROM 
        ventes_details vd
      LEFT JOIN 
        produits p ON vd.produit_id = p.id
      WHERE 
        vd.vente_id = $1
      `,
      [vente_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Détails de vente non trouvés" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des détails de la vente :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};
