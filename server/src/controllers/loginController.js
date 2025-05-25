const bcrypt = require("bcrypt"); // Assurez-vous que vous utilisez bcrypt
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  });
}

const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    db.get("SELECT * FROM utilisateurs WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error("Erreur base de données :", err);
        return res.status(500).json({ message: "Erreur serveur." });
      }

      if (!user) {
        return res.status(401).json({ message: "Identifiants incorrects." });
      }

      const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

      if (!isMatch) {
        return res.status(401).json({ message: "Identifiants incorrects." });
      }

      const token = generateToken(user);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "Strict",
      });

      // 🔁 Réponse adaptée à ce que React attend
      return res.status(200).json({
        message: "Connexion réussie",
        token,
        role: user.role, // ajouté pour correspondre au localStorage côté React
      });
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Obtenir les infos du profil via le token
const profile = (req, res) => {
  const token =
    req.cookies.authToken || req.headers.authorization?.split(" ")[1]; // Récupérer depuis le cookie ou les headers
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Token invalide ou expiré" });

    db.get(
      "SELECT id, nom, email, role FROM utilisateurs WHERE id = ?",
      [decoded.id],
      (err, user) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.json(user);
      }
    );
  });
};

const logout = (req, res) => {
  // Suppression du cookie contenant le token
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Réponse de déconnexion
  res.status(200).json({ message: "Déconnexion réussie" });
};

module.exports = { login, profile, logout };
