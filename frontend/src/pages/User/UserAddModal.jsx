import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertBottomLeft from '../../components/AlertBottomLeft';

function UserAddModal({ isOpen, onClose, onSuccess }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('employe');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNom('');
      setEmail('');
      setMotDePasse('');
      setRole('employe');
      setAlertMessage('');
      setAlertType('success');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);

    // Réinitialiser l'alerte après 3 secondes
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !email || !motDePasse) {
      showAlert('Tous les champs sont obligatoires.', 'error');
      return;
    }

    const newUser = {
      nom,
      email,
      mot_de_passe: motDePasse,
      role,
    };

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:9000/api/utilisateurs', newUser);

      if (response.status === 201) {
        showAlert("Utilisateur ajouté avec succès !", 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data.message || 'Erreur lors de l\'ajout de l\'utilisateur';

        if (msg.includes('nom est déjà utilisé')) {
          showAlert('Ce nom est déjà pris. Veuillez en choisir un autre.', 'error');
        } else if (msg.includes('email est déjà utilisé')) {
          showAlert('Cet email est déjà utilisé. Veuillez en choisir un autre.', 'error');
        } else {
          showAlert(msg, 'error');
        }
      } else {
        console.error('Erreur de connexion au serveur', err);
        showAlert('Erreur de connexion. Veuillez réessayer plus tard.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ajouter un Utilisateur</h2>

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

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
              disabled={loading}
            >
              {loading ? 'Ajout en cours...' : "Ajouter l'Utilisateur"}
            </button>
          </form>
        </div>
      </div>

      {alertMessage && (
        <AlertBottomLeft message={alertMessage} type={alertType} />
      )}
    </>
  );
}

export default UserAddModal;
