import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';

function UserUpdate() {
  const { id } = useParams();  // Récupérer l'ID de l'utilisateur depuis l'URL
  const navigate = useNavigate();  // Pour rediriger après la mise à jour
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const URL = import.meta.env.VITE_URL_API;
  // Charger les données de l'utilisateur
  useEffect(() => {
    fetch(`${URL}/api/utilisateurs/${id}`)  // Ajuste l'URL de l'API si nécessaire
      .then((response) => response.json())
      .then((data) => {
        setNom(data.nom);
        setEmail(data.email);
        setRole(data.role);
      })
      .catch((error) => console.error('Erreur lors du chargement des données de l\'utilisateur:', error));
  }, [id]);

  // Gérer la mise à jour de l'utilisateur
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = { nom, email, role };

    fetch(`${URL}/api/utilisateurs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then(() => {
        console.log('Utilisateur mis à jour');
        navigate('/UserList');  // Redirige vers la liste des utilisateurs après la mise à jour
      })
      .catch((error) => console.error('Erreur lors de la mise à jour de l\'utilisateur:', error));
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Modifier l'Utilisateur</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Email de l'utilisateur"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Rôle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="admin">administrateur</option>
                <option value="responsable_ventes">responsable des ventes</option>
                <option value="gestionnaire_stock">gestionnaire des stock</option>
                <option value="employe">employé</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserUpdate;
