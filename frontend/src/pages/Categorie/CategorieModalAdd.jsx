import React, { useState } from 'react';
import axios from 'axios';

function CategorieModalAdd({ isOpen, onClose, onSuccess }) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const URL = import.meta.env.VITE_URL_API;
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !description) {
      setError('Tous les champs sont requis');
      return;
    }

    const category = { nom, description };

    try {
      const response = await axios.post(`${URL}/api/categories`, category);

      setNom('');
      setDescription('');
      setError(null);
      onSuccess(); // Recharger la liste
      onClose();   // Fermer le modal
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la catégorie:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ajouter une catégorie</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-3">{error}</p>}

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom de la catégorie"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de la catégorie"
            />
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategorieModalAdd;
