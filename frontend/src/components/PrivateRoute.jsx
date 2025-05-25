import React from "react";
import { Navigate } from "react-router-dom";

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
    const token = localStorage.getItem("authToken");
    // Si le token existe et n'est pas expiré (optionnel, selon ton besoin)
    if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken.exp < Date.now() / 1000) {
            return false;  // Le token est expiré
        }
        return true;
    }
    return false;
};

// Fonction pour obtenir le rôle de l'utilisateur (extrait du token JWT)
export const getUserRole = () => {
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1])); // Décoder le token JWT
            return decodedToken?.role || null; // Renvoyer le rôle ou null si absent
        } catch (error) {
            console.error("Erreur lors du décodage du token :", error);
            return null;
        }
    }
    return null;
};

// Route protégée pour les utilisateurs ayant un rôle spécifique
export const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole();

    if (requiredRole && !requiredRole.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Redirection pour les utilisateurs déjà authentifiés
export const RedirectIfAuthenticated = ({ children }) => {
    if (isAuthenticated()) {
        return <Navigate to="/" replace />; // Redirige vers la page d'accueil si déjà connecté
    }

    return children;
};
