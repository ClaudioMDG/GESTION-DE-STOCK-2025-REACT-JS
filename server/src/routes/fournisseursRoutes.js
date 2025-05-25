// fournisseurRoutes.js
const express = require('express');
const router = express.Router();
const fournisseurController = require('../controllers/fournisseurController');

// Route pour ajouter un fournisseur
router.post('/', fournisseurController.ajouterFournisseur);
router.get('/:id', fournisseurController.getFournisseurById);
router.get('/', fournisseurController.getAllFournisseurs);
router.put('/:id', fournisseurController.updateFournisseur);
router.delete('/:id', fournisseurController.deleteFournisseur);

module.exports = router;
