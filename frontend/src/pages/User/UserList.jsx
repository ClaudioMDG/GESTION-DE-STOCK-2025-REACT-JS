import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus } from 'lucide-react';
import Sidebar from '../Layouts/Sidebar';
import { Link } from 'react-router-dom';
import UserAddModal from './UserAddModal';
import AlertBottomLeft from '../../components/AlertBottomLeft'; // Assure-toi du bon chemin

function UserList() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: 'success' });

  // Charger les utilisateurs
  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/utilisateurs');
      setUtilisateurs(response.data);
    } catch (error) {
      console.error('Erreur de chargement :', error);
      setAlert({ message: 'Erreur lors du chargement des utilisateurs', type: 'error' });
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/api/utilisateurs/${id}`);
      setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
      setAlert({ message: 'Utilisateur supprimé avec succès.', type: 'success' });
    // Réinitialiser l'alerte après 3 secondes
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setAlert({ message: 'Erreur lors de la suppression.', type: 'error' });
    // Réinitialiser l'alerte après 3 secondes
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-50 p-4">
        <div className="w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              Liste des utilisateurs
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter Utilisateur
            </button>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rôle</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((utilisateur) => (
                <tr key={utilisateur.id} className="border-b border-gray-200">
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{utilisateur.nom}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{utilisateur.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{utilisateur.role}</td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      to={`/UserUpdate/${utilisateur.id}`}
                      className="inline-flex items-center text-yellow-500 hover:text-yellow-600 mr-2"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(utilisateur.id)}
                      className="inline-flex items-center text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modale d'ajout */}
        <UserAddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchUtilisateurs();
            setIsModalOpen(false);
            setAlert({ message: 'Utilisateur ajouté avec succès.', type: 'success' });
          }}
        />

        {/* Alerte */}
        <AlertBottomLeft message={alert.message} type={alert.type} />
      </div>
    </div>
  );
}

export default UserList;
