const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL // à adapter à ton environnement
});

// Ajouter un détail d'achat
exports.addDetailsAchat = async (req, res) => {
  const { achat_id, produit_id, quantite, prix_unitaire, total } = req.body;

  if (!achat_id || !produit_id || !quantite || !prix_unitaire || !total) {
    return res.status(400).json({ error: 'Les données sont incomplètes ou invalides' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO achats_details (achat_id, produit_id, quantite, prix_unitaire, total)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [achat_id, produit_id, quantite, prix_unitaire, total]
    );

    res.status(201).json({
      message: 'Détail d\'achat ajouté avec succès',
      detail_id: result.rows[0].id
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du détail d\'achat :', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du détail d\'achat' });
  }
};

// Récupérer les détails d'un achat
exports.getDetailsByAchatId = async (req, res) => {
  const { achat_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        vd.*, 
        p.nom AS produit_nom 
      FROM 
        achats_details vd
      LEFT JOIN 
        produits p ON vd.produit_id = p.id
      WHERE 
        vd.achat_id = $1
      `,
      [achat_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun détail trouvé pour cet achat' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des détails de l\'achat :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de l\'achat' });
  }
};
