const express = require("express");
const router = express.Router();
const achatController = require("../controllers/achatController");
const detailsAchatController = require("../controllers/detailsAchatController");

// Routes pour les achats
router.post("/", achatController.createAchat);
router.get("/", achatController.getAllAchats);
router.get("/:id", achatController.getAchatById);

// 🔽 Routes pour les détails d'achat
router.post("/details", detailsAchatController.addDetailsAchat);
router.get("/:achat_id/details", detailsAchatController.getDetailsByAchatId);
router.delete("/deleteachats/:id", achatController.deleteAchat);
module.exports = router;
