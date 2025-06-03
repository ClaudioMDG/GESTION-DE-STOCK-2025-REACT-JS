const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // adapte selon ton config
});

// Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produits");
    const produitsAvecUrlImages = result.rows.map((produit) => ({
      ...produit,
      image_url: produit.image_path
        ? `http://localhost:9000/public${produit.image_path}`
        : null,
    }));
    res.status(200).json(produitsAvecUrlImages);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des produits",
      error: err.message,
    });
  }
};

// Récupérer un produit par son ID
exports.getProduitById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM produits WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération du produit",
      error: err.message,
    });
  }
};

// Ajouter un nouveau produit avec upload d'image
exports.addProduit = async (req, res) => {
  const {
    nom,
    description,
    prix_achat,
    prix_vente,
    quantite_en_stock,
    seuil_alerte,
    categorie_id,
    fournisseur_id,
  } = req.body;

  const image_path = req.file ? "/images/" + req.file.filename : null;

  const query = `
    INSERT INTO produits
    (nom, description, prix_achat, prix_vente, quantite_en_stock, seuil_alerte, categorie_id, fournisseur_id, image_path)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id
  `;

  const values = [
    nom,
    description,
    prix_achat,
    prix_vente,
    quantite_en_stock,
    seuil_alerte,
    categorie_id,
    fournisseur_id,
    image_path,
  ];

  try {
    const result = await pool.query(query, values);
    res.status(201).json({
      message: "Produit ajouté avec succès",
      produitId: result.rows[0].id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du produit",
      error: err.message,
    });
  }
};

// Mettre à jour un produit existant avec possibilité de modifier l'image
exports.updateProduit = async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    description,
    prix_achat,
    prix_vente,
    quantite_en_stock,
    seuil_alerte,
    categorie_id,
    fournisseur_id,
  } = req.body;

  const image_path = req.file ? "/images/" + req.file.filename : null;

  try {
    let query, values;

    if (image_path) {
      query = `
        UPDATE produits SET
          nom = $1,
          description = $2,
          prix_achat = $3,
          prix_vente = $4,
          quantite_en_stock = $5,
          seuil_alerte = $6,
          categorie_id = $7,
          fournisseur_id = $8,
          image_path = $9
        WHERE id = $10
      `;
      values = [
        nom,
        description,
        prix_achat,
        prix_vente,
        quantite_en_stock,
        seuil_alerte,
        categorie_id,
        fournisseur_id,
        image_path,
        id,
      ];
    } else {
      query = `
        UPDATE produits SET
          nom = $1,
          description = $2,
          prix_achat = $3,
          prix_vente = $4,
          quantite_en_stock = $5,
          seuil_alerte = $6,
          categorie_id = $7,
          fournisseur_id = $8
        WHERE id = $9
      `;
      values = [
        nom,
        description,
        prix_achat,
        prix_vente,
        quantite_en_stock,
        seuil_alerte,
        categorie_id,
        fournisseur_id,
        id,
      ];
    }

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du produit",
      error: err.message,
    });
  }
};

// Supprimer un produit
exports.deleteProduit = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM produits WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    // Gestion spécifique des erreurs FK (Postgres error code '23503' = foreign key violation)
    if (err.code === "23503") {
      return res.status(400).json({
        message:
          "Impossible de supprimer ce produit car il est référencé dans d'autres enregistrements.",
        error: err.detail,
      });
    }
    res.status(500).json({
      message: "Erreur lors de la suppression du produit",
      error: err.message,
    });
  }
};

// Mettre à jour le stock d'un produit
exports.updateStock = async (produit_id, quantite, callback) => {
  try {
    const query = `
      UPDATE produits
      SET quantite_en_stock = quantite_en_stock + $1
      WHERE id = $2
    `;
    const result = await pool.query(query, [quantite, produit_id]);
    if (result.rowCount === 0) {
      return callback(new Error("Produit non trouvé pour la mise à jour du stock."));
    }
    callback(null);
  } catch (err) {
    callback(err);
  }
};
