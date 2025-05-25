import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import AlertBottomLeft from "../../components/AlertBottomLeft";

function ClientAddModal({ isOpen, onClose, onClientAdded, handleAddSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage("");

    try {
      const response = await axios.post(
        "http://localhost:9000/api/clients",
        formData
      );

      if (onClientAdded) onClientAdded(response.data);
      setFormData({ nom: "", email: "", telephone: "", adresse: "" });
      handleAddSuccess();
      onClose();
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data && err.response.data.message) {
        const msg = err.response.data.message.toLowerCase();

        if (msg.includes("nom")) {
          setAlertMessage("Ce nom est déjà utilisé.");
        } else if (msg.includes("adresse")) {
          setAlertMessage("Cette adresse est déjà enregistrée.");
        } else if (msg.includes("téléphone") || msg.includes("telephone")) {
          setAlertMessage("Ce numéro de téléphone est interdit ou déjà utilisé.");
        } else if (
          msg.includes("lié") && 
          msg.includes("vente") && 
          msg.includes("supprimer")
        ) {
          // Message spécifique à la suppression (au cas où tu l’affiches ici)
          setAlertMessage(
            "Impossible de supprimer ce client car il est lié à une ou plusieurs ventes."
          );
        } else {
          setAlertMessage("Client lier à  une vente ");
        }
      } else {
        setAlertMessage("Erreur serveur. Veuillez réessayer plus tard.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X />
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Ajouter un client
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Nom du client"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Email du client"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Téléphone"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Adresse</label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Adresse"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Ajouter le client
            </button>
          </form>
        </div>
      </div>

      {/* Affiche l'alerte si message d'erreur */}
      {alertMessage && (
        <AlertBottomLeft message={alertMessage} type="error" duration={5000} />
      )}
    </>
  );
}

export default ClientAddModal;
