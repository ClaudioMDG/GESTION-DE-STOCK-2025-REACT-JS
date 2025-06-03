const db = require("../config/db");

// Récupérer tous les produits
exports.getAllProduits = (req, res) => {
  db.all("SELECT * FROM produits", (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des produits",
        error: err,
      });
    }

    // Modifier chaque produit pour ajouter l'URL complète de l'image
    const produitsAvecUrlImages = rows.map((produit) => {
      return {
        ...produit,
        image_url: produit.image_url
          ? `http://localhost:9000/public/images/${produit.image_url}`
          : null,
      };
    });

    res.status(200).json(produitsAvecUrlImages);
  });
};


// Récupérer un produit par son ID
exports.getProduitById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM produits WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération du produit",
        error: err,
      });
    }
    if (!row) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(row);
  });
};

// Ajouter un nouveau produit avec upload d'image
exports.addProduit = (req, res) => {
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

  let image_path = null;
  if (req.file) {
    image_path = "/images/" + req.file.filename; // chemin relatif pour accès
  }

  db.run(
    `INSERT INTO produits 
    (nom, description, prix_achat, prix_vente, quantite_en_stock, seuil_alerte, categorie_id, fournisseur_id, image_path) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nom,
      description,
      prix_achat,
      prix_vente,
      quantite_en_stock,
      seuil_alerte,
      categorie_id,
      fournisseur_id,
      image_path,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de l'ajout du produit", error: err });
      }
      res.status(201).json({
        message: "Produit ajouté avec succès",
        produitId: this.lastID,
      });
    }
  );
};

// Mettre à jour un produit existant avec possibilité de modifier l'image
exports.updateProduit = (req, res) => {
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

  let image_path = null;
  if (req.file) {
    image_path = "/images/" + req.file.filename;
  }

  // Si image_path est défini, on met à jour aussi l'image, sinon on laisse la colonne telle quelle
  let query, params;

  if (image_path) {
    query = `UPDATE produits SET nom = ?, description = ?, prix_achat = ?, prix_vente = ?, quantite_en_stock = ?, seuil_alerte = ?, categorie_id = ?, fournisseur_id = ?, image_path = ? WHERE id = ?`;
    params = [
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
    query = `UPDATE produits SET nom = ?, description = ?, prix_achat = ?, prix_vente = ?, quantite_en_stock = ?, seuil_alerte = ?, categorie_id = ?, fournisseur_id = ? WHERE id = ?`;
    params = [
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

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour du produit",
        error: err,
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit mis à jour avec succès" });
  });
};

// Supprimer un produit
exports.deleteProduit = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM produits WHERE id = ?", [id], function (err) {
    if (err) {
      // Gestion spécifique des erreurs de clé étrangère
      if (err.code === "SQLITE_CONSTRAINT" && err.message.includes("FOREIGN KEY")) {
        return res.status(400).json({
          message: "Impossible de supprimer ce produit car il est référencé dans d'autres enregistrements.",
          error: err.message,
        });
      }
      return res.status(500).json({
        message: "Erreur lors de la suppression du produit",
        error: err.message,
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès" });
  });
};

// ---------------------------------------------------------------------------------------------------------------------------------
exports.updateStock = (produit_id, quantite, callback) => {
  const query = `
    UPDATE produits
    SET quantite_en_stock = quantite_en_stock + ?
    WHERE id = ?
  `;
  db.run(query, [quantite, produit_id], function (err) {
    if (err) {
      return callback(err);
    }
    if (this.changes === 0) {
      return callback(
        new Error("Produit non trouvé pour la mise à jour du stock.")
      );
    }
    callback(null);
  });
};
