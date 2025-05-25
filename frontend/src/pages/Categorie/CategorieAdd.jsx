import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';
import AlertBottomLeft from '../../components/AlertBottomLeft';

function CategorieAdd() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: '', type: '' });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !description) {
      showAlert('Tous les champs sont requis', 'error');
      return;
    }

    const category = { nom, description };

    try {
      const response = await fetch('http://localhost:9000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        showAlert('Catégorie ajoutée avec succès', 'success');
        setTimeout(() => {
          navigate('/categories');
        }, 1500);
      } else {
        const errorData = await response.json();
        const msg = errorData.message ? errorData.message.toLowerCase() : '';

        if (msg.includes('nom')) {
          showAlert('Le nom de la catégorie est déjà utilisé.', 'error');
        } else {
          showAlert(errorData.message || 'Une erreur est survenue', 'error');
        }
      }
    } catch (error) {
      showAlert('Erreur de connexion', 'error');
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 relative">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ajouter une nouvelle catégorie</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                placeholder="Entrez le nom de la catégorie"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                placeholder="Entrez la description de la catégorie"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              >
                Ajouter la catégorie
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
    </div>
  );
}

export default CategorieAdd;
