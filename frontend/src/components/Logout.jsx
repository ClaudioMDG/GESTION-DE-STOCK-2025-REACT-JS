import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer les données locales
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');

    // Rediriger vers la page de connexion
    navigate('/login');
  };

  return (
    <div className="p-4 mt-auto">
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 text-red-700"
      >
        <LogOut className="w-5 h-5" />
        Se déconnecter
      </button>
    </div>
  );
}

export default Logout;
