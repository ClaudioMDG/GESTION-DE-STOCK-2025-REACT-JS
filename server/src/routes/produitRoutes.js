const express = require("express");
const router = express.Router();
const ProduitController = require("../controllers/produitController");

const multer = require("multer");
const path = require("path");

// Configuration multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
router.get("/", ProduitController.getAllProduits);
router.get("/:id", ProduitController.getProduitById);

// Ajout produit avec upload image
router.post("/", upload.single("image"), ProduitController.addProduit);

// Mise à jour produit avec upload image optionnel
router.put("/:id", upload.single("image"), ProduitController.updateProduit);

router.delete("/:id", ProduitController.deleteProduit);

module.exports = router;
