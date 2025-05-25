const express = require("express");
const router = express.Router();
const venteController = require("../controllers/venteController");
const detailsVenteController = require("../controllers/detailsVenteController");

// Route pour créer une vente
router.post("/", venteController.createVente);

// Route pour récupérer toutes les ventes
router.get("/", venteController.getAllVentes);

// Route pour récupérer une vente par son ID
router.get("/:id", venteController.getVenteById);

// Route pour ajouter un détail de vente
router.post("/details", detailsVenteController.addDetailsVente);

// Route pour récupérer les détails d'une vente par son ID
router.get("/:vente_id/details", detailsVenteController.getDetailsByVenteId);

router.delete("/delete/:id", venteController.deleteVente);

module.exports = router;
