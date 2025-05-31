import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

function Logout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <>
      <div className="p-4 mt-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 text-red-700"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmation</h2>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Logout;
