const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données
const db = new sqlite3.Database('./gestion-stock.db', (err) => {
  if (err) {
    console.error('❌ Erreur lors de la connexion à la base de données :', err.message);
  } else {
    console.log('✅ Connexion à la base de données réussie.');

    // Activation des clés étrangères
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('❌ Erreur lors de l’activation des clés étrangères :', err.message);
      } else {
        console.log('🔐 Clés étrangères activées.');

        // Création des tables
        db.serialize(() => {
          // Table utilisateurs
          db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mot_de_passe TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'gestionnaire_stock', 'responsable_ventes', 'employe')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Table catégories
          db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Table fournisseurs
          db.run(`CREATE TABLE IF NOT EXISTS fournisseurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT,
            email TEXT,
            telephone TEXT,
            adresse TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Table clients
          db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT UNIQUE,
            email TEXT UNIQUE,
            telephone TEXT UNIQUE,
            adresse TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Table produits
          db.run(`CREATE TABLE IF NOT EXISTS produits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT,
            description TEXT,
            prix_achat REAL,
            prix_vente REAL,
            quantite_en_stock INTEGER,
            seuil_alerte INTEGER,
            categorie_id INTEGER,
            fournisseur_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categorie_id) REFERENCES categories(id),
            FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
          )`);

          // Table achats
          db.run(`CREATE TABLE IF NOT EXISTS achats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fournisseur_id INTEGER,
            date_achat DATETIME,
            total REAL,
            utilisateur_id INTEGER,
            FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id),
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
          )`);

          // Table achats_details
          db.run(`CREATE TABLE IF NOT EXISTS achats_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            achat_id INTEGER,
            produit_id INTEGER,
            quantite INTEGER,
            prix_unitaire REAL,
            total REAL,
            FOREIGN KEY (achat_id) REFERENCES achats(id),
            FOREIGN KEY (produit_id) REFERENCES produits(id)
          )`);

          // Table ventes
          db.run(`CREATE TABLE IF NOT EXISTS ventes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            date_vente DATETIME,
            total REAL,
            utilisateur_id INTEGER,
            FOREIGN KEY (client_id) REFERENCES clients(id),
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
          )`);

          // Table ventes_details
          db.run(`CREATE TABLE IF NOT EXISTS ventes_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vente_id INTEGER,
            produit_id INTEGER,
            quantite INTEGER,
            prix_unitaire REAL,
            total REAL,
            FOREIGN KEY (vente_id) REFERENCES ventes(id),
            FOREIGN KEY (produit_id) REFERENCES produits(id)
          )`);

          // Table mouvements_stock
          db.run(`CREATE TABLE IF NOT EXISTS mouvements_stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produit_id INTEGER,
            type TEXT,
            quantite INTEGER,
            date DATETIME,
            raison TEXT,
            utilisateur_id INTEGER,
            FOREIGN KEY (produit_id) REFERENCES produits(id),
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
          )`);

          console.log('📦 Toutes les tables ont été créées avec succès.');
        });
      }
    });
  }
});

module.exports = db;
