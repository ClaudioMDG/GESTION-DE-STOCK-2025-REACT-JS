import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertBottomLeft from "../components/AlertBottomLeft";
import loginImage from "../assets/bg_login.jpg";

import {
  Package,
  Bell,
  FileText,
  Handshake,
  FileUp,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const URL = import.meta.env.VITE_URL_API;

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !motDePasse.trim()) {
      return showError("Veuillez remplir tous les champs.");
    }

    if (!isValidEmail(email)) {
      return showError("Adresse email invalide.");
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${URL}/api/login`,
        { email, mot_de_passe: motDePasse },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
        if (data.role) localStorage.setItem("userRole", data.role);
        navigate("/");
      } else {
        showError(data.message || "Identifiants invalides.");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const bandeauItems = [
    { icon: <Package size={18} />, text: "Suivi de stock en temps réel" },
    { icon: <Bell size={18} />, text: "Alertes automatiques de réapprovisionnement" },
    { icon: <FileText size={18} />, text: "Historique complet des mouvements" },
    { icon: <Handshake size={18} />, text: "Gestion des fournisseurs et clients" },
    { icon: <FileUp size={18} />, text: "Exportation des rapports PDF/Excel" },
    { icon: <Users size={18} />, text: "Accès multi-utilisateurs sécurisé" },
    { icon: <Lock size={18} />, text: "Sauvegarde & sécurité des données" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header bandeau */}
      <header className="relative bg-blue-600 text-white py-4 shadow-md overflow-hidden">
        <div className="w-full overflow-hidden relative h-7">
          <div className="absolute flex gap-16 whitespace-nowrap animate-marquee-infinite text-sm sm:text-base font-medium px-4">
            {bandeauItems.concat(bandeauItems).map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {item.icon}
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Form */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 sm:px-10 lg:px-20 bg-white shadow-md">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8">
              Veuillez entrer vos identifiants pour accéder à votre compte.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="peer w-full pl-10 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                >
                  Adresse e-mail
                </label>
              </div>

              {/* Mot de passe */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="motDePasse"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="peer w-full pl-10 pr-10 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="motDePasse"
                  className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-md text-white font-semibold transition-colors duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                En vous connectant, vous acceptez nos{" "}
                <a href="/terms" className="text-blue-600 hover:underline">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </form>
          </div>
        </div>

        {/* Image */}
        <div className="hidden md:block w-1/2 h-full">
          <img
            src={loginImage}
            alt="Écran de connexion"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center text-gray-500 text-sm py-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} MonEntreprise. Tous droits réservés.
          </p>
          <div className="mt-2 space-x-4">
            <a href="/mentions-legales" className="hover:text-blue-600">
              Mentions légales
            </a>
            <a href="/contact" className="hover:text-blue-600">
              Contact
            </a>
            <a href="/support" className="hover:text-blue-600">
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Erreur affichée */}
      {errorMessage && (
        <AlertBottomLeft message={errorMessage} type="error" duration={4000} />
      )}
    </div>
  );
}

export default Login;
