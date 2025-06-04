const { Pool } = require('pg');

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gstock',
  password: 'votre_mot_de_passe',
  port: 6042,
});

module.exports = db;
// const sqlite3 = require('sqlite3').verbose();

// // Connexion à la base de données
// const db = new sqlite3.Database('./gestion-stock.db', (err) => {
//   if (err) {
//     console.error('❌ Erreur lors de la connexion à la base de données :', err.message);
//   } else {
//     console.log('✅ Connexion à la base de données réussie.');
//   }
// });

// module.exports = db;
