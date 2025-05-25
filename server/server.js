const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const URL = process.env.PORT_SERVER;
const clientRoutes = require("./src/routes/clientsRoutes");
const fournisseurRoutes = require("./src/routes/fournisseursRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const produitRoutes = require("./src/routes/produitRoutes");
const userRoutes = require("./src/routes/utilisateurRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const venteRoutes = require("./src/routes/venteRoutes");
const achatRoutes = require("./src/routes/achatRoutes"); // Nouvelle route pour achats
const statsRoutes = require("./src/routes/statsRoutes"); // Nouvelle route pour achats

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir les fichiers statiques pour accéder aux images uploadées
app.use("/images", express.static("public/images"));

// Routes
app.use("/api/clients", clientRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/utilisateurs", userRoutes);
app.use("/api/ventes", venteRoutes);
app.use("/api/achats", achatRoutes); // Route des achats
app.use("/api/stats", statsRoutes); // Route des achats

app.use("/api", loginRoutes);

app.listen(URL, () => {
  console.log("✅ Serveur en marche sur le port 9000");
});
