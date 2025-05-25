import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategorieEditModal({ isOpen, onClose, categorie, onSuccess }) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const URL = import.meta.env.VITE_URL_API;
  
  useEffect(() => {
    if (categorie) {
      setNom(categorie.nom || '');
      setDescription(categorie.description || '');
    }
  }, [categorie]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !description) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      await axios.put(`${URL}/api/categories/${categorie.id}`, {
        nom,
        description,
      });

      setError(null);
      onSuccess(); // Met à jour la liste des catégories
      onClose();   // Ferme le modal
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue');
      }
    }
  };

  if (!isOpen || !categorie) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Modifier la catégorie</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-3">{error}</p>}

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategorieEditModal;
