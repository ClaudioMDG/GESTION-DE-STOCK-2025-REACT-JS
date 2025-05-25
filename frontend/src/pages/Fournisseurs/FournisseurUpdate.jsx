import React, { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';

function FournisseurUpdate() {
  const [fournisseur, setFournisseur] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: ''
  });
  const { id } = useParams();  // Récupère l'id du fournisseur depuis l'URL
  const Navigate= useNavigate();

  // Charger les données du fournisseur à partir de l'API
  useEffect(() => {
    fetch(`http://localhost:9000/api/fournisseurs/${id}`)
      .then((response) => response.json())
      .then((data) => setFournisseur(data))
      .catch((error) => console.error('Erreur lors du chargement du fournisseur:', error));
  }, [id]);

  // Gérer la mise à jour du fournisseur
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFournisseur((prevFournisseur) => ({
      ...prevFournisseur,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:9000/api/fournisseurs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fournisseur),
    })
      .then((response) => response.json())
      .then(() => {
        console.log('Fournisseur mis à jour');
        Navigate('/FournisseurList');  // Rediriger vers la liste des fournisseurs
      })
      .catch((error) => console.error('Erreur lors de la mise à jour du fournisseur:', error));
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mise à jour du Fournisseur</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nom" className="block text-sm font-medium text-gray-600">Nom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={fournisseur.nom}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={fournisseur.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-600">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={fournisseur.telephone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-600">Adresse</label>
          <textarea
            id="adresse"
            name="adresse"
            value={fournisseur.adresse}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Mettre à jour le fournisseur
        </button>
      </form>
    </div>
  );
}

export default FournisseurUpdate;
