import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import AlertBottomLeft from "../../components/AlertBottomLeft"; // <-- Assure-toi du bon chemin

function ClientEditModal({ isOpen, onClose, client, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || "",
        email: client.email || "",
        telephone: client.telephone || "",
        adresse: client.adresse || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage("");

    if (!formData.nom.trim()) {
      setAlertMessage("Le nom est requis.");
      return;
    }

    try {
      await axios.put(`http://localhost:9000/api/clients/${client.id}`, formData);
      onSuccess(); // succès : recharge la liste + ferme modal
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        const msg = err.response.data.message.toLowerCase();

        if (msg.includes("nom")) {
          setAlertMessage("Ce nom est déjà utilisé.");
        } else if (msg.includes("adresse")) {
          setAlertMessage("Cette adresse est déjà utilisée.");
        } else if (msg.includes("téléphone") || msg.includes("telephone")) {
          setAlertMessage("Ce numéro de téléphone est interdit ou déjà utilisé.");
        } else {
          setAlertMessage("Erreur lors de la mise à jour du client.");
        }
      } else {
        setAlertMessage("Erreur serveur. Veuillez réessayer.");
      }
    }
  };

  if (!isOpen || !client) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white w-full max-w-md rounded shadow-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Modifier Client
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Téléphone</label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>

      {alertMessage && (
        <AlertBottomLeft message={alertMessage} type="error" duration={5000} />
      )}
    </>
  );
}

export default ClientEditModal;
