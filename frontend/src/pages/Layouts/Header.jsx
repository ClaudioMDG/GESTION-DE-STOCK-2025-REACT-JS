import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: "", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUser({
          nom: decoded.nom || decoded.name || "Utilisateur",
          email: decoded.email || "email@exemple.com",
        });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole"); // si tu stockes ça aussi
    navigate("/login");
  };

  return (
    <header
      className="fixed top-0 left-64 right-0 h-16 bg-white shadow px-6 flex items-center justify-between z-10"
      role="banner"
      aria-label="Barre de navigation principale"
    >
      <div>
        <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Gestion des clients</p>
      </div>

      <div className="flex items-center space-x-4" aria-live="polite">
        <div className="text-right">
          <p className="font-semibold text-gray-700">{user.nom}</p>
          <p className="text-xs text-gray-500 truncate max-w-xs">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Déconnexion"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

export default Header;