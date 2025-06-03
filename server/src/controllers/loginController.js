const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // adapte selon ton environnement
});

// 🔐 Générer le token JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "1h" }
  );
}

// 🔓 Connexion utilisateur
const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const result = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
    const user = result.rows[0];

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

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// 👤 Obtenir le profil depuis le token
const profile = async (req, res) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    try {
      const result = await pool.query(
        "SELECT id, nom, email, role FROM utilisateurs WHERE id = $1",
        [decoded.id]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });
};

// 🔒 Déconnexion
const logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Déconnexion réussie" });
};

module.exports = { login, profile, logout };
