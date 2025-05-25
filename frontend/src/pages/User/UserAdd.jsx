import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';

function UserAdd() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('employe'); // Valeur par défaut
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Pour gérer l'état de chargement
  const navigate = useNavigate();

  // Fonction pour gérer l'ajout de l'utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des champs vides
    if (!nom || !email || !motDePasse) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    const newUser = {
      nom,
      email,
      mot_de_passe: motDePasse,
      role,
    };

    setLoading(true); // Lancement du chargement pendant l'attente de la réponse

    try {
      const response = await fetch('http://localhost:9000/api/utilisateurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        // Rediriger après ajout réussi
        navigate('/userList'); // Rediriger vers la liste des utilisateurs
      } else {
        setError(data.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      }
    } catch (error) {
      console.error('Erreur de connexion au serveur', error);
      setError('Erreur de connexion. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ajouter un Utilisateur</h2>

          {/* Affichage des erreurs */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-600">Nom</label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Nom complet"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-600">Mot de Passe</label>
              <input
                type="password"
                id="mot_de_passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Mot de passe"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-600">Rôle</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
              >
                <option value="employe">Employé</option>
                <option value="gestionnaire_stock">Gestionnaire de Stock</option>
                <option value="responsable_ventes">Responsable des Ventes</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
                disabled={loading}
              >
                {loading ? 'Ajout en cours...' : "Ajouter l'Utilisateur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserAdd;
