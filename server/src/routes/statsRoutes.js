const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Route GET pour récupérer les données du tableau de bord avec filtres en query
router.get('/', dashboardController.getDashboardData);

module.exports = router;
