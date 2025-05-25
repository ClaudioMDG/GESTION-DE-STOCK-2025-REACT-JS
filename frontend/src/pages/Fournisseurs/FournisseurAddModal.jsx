import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import AlertBottomLeft from "../../components/AlertBottomLeft"; // adapte le chemin si besoin

function FournisseurAddModal({ isOpen, onClose, onFournisseurAdded }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const URL = import.meta.env.VITE_URL_API;
  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${URL}/api/fournisseurs`,
        formData
      );

      if (onFournisseurAdded) onFournisseurAdded(response.data);
      onClose();
    } catch (error) {
      console.error("Erreur:", error);

      if (error.response && error.response.data && error.response.data.message) {
        const msg = error.response.data.message.toLowerCase();

        if (msg.includes("champ nom")) {
          showAlert("Le nom du fournisseur est déjà utilisé.");
        } else if (msg.includes("champ email")) {
          showAlert("L'email est déjà utilisé.");
        } else if (msg.includes("champ téléphone") || msg.includes("champ telephone")) {
          showAlert("Ce numéro de téléphone est déjà utilisé ou interdit.");
        } else if (msg.includes("champ adresse")) {
          showAlert("Cette adresse est déjà utilisée.");
        } else if (msg.includes("tous les champs sont requis")) {
          showAlert("Tous les champs sont obligatoires.");
        } else {
          showAlert("Erreur lors de l'ajout du fournisseur.");
        }
      } else {
        showAlert("Erreur réseau : " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-700 hover:text-red-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Ajouter un fournisseur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            placeholder="Adresse"
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>

        {alert.message && (
          <div className="absolute bottom-4 left-4">
            <AlertBottomLeft message={alert.message} type={alert.type} />
          </div>
        )}
      </div>
    </div>
  );
}

export default FournisseurAddModal;
