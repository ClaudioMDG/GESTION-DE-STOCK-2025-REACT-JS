import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertBottomLeft from "../components/AlertBottomLeft";
import loginImage from "../assets/bg_login.jpg";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Renommé pour éviter toute confusion avec 'error' axios
  const [loading, setLoading] = useState(false);
  const URL = import.meta.env.VITE_URL_API;
 
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !motDePasse.trim()) {
      setErrorMessage("Veuillez remplir tous les champs.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Adresse email invalide.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${URL}/api/login`,
        {
          email,
          mot_de_passe: motDePasse,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data && data.token) {
        localStorage.setItem("authToken", data.token);
        if (data.role) {
          localStorage.setItem("userRole", data.role);
        }
        navigate("/");
      } else {
        setErrorMessage(data.message || "Identifiants invalides.");
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      } else {

        setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.");
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Form Column */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-white shadow-lg z-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Se connecter
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Champ Email */}
            <div className="relative mb-6">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
              >
                Email
              </label>
            </div>

            {/* Champ Mot de passe */}
            <div className="relative mb-6">
              <input
                type="password"
                id="motDePasse"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                required
                className="peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="motDePasse"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
              >
                Mot de passe
              </label>
            </div>

            <button
              type="submit"
              className={`w-full p-2 rounded-md text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>

      {/* Image Column */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src={loginImage}
          alt="Connexion"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Alerte affichée en bas à gauche */}
      {errorMessage && (
        <AlertBottomLeft
          message={errorMessage}
          type="error"
          duration={4000}
        />
      )}
    </div>
  );
}

export default Login;
