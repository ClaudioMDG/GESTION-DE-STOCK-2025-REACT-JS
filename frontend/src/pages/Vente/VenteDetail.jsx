import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Si vous utilisez React Router pour la navigation

function VenteDetail() {
  const { venteId } = useParams(); // Récupère l'id de la vente depuis l'URL
  const [vente, setVente] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Récupération des détails de la vente depuis l'API
    fetch(`http://localhost:9000/api/ventes/${venteId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des détails de la vente');
        }
        return response.json();
      })
      .then(data => setVente(data))
      .catch(error => setError(error.message));
  }, [venteId]);

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  if (!vente) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Détails de la Vente</h1>

      {/* Détails de la vente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Client :</h3>
        <p className="text-gray-700">{vente.client.nom}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Date de la Vente :</h3>
        <p className="text-gray-700">{new Date(vente.date_vente).toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Produits :</h3>
        <ul>
          {vente.produits.map(produit => (
            <li key={produit.produit_id} className="flex justify-between mb-2">
              <span>{produit.nom}</span>
              <span>{produit.quantite} x {produit.prix_unitaire} € = {produit.total} €</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Total :</h3>
        <p className="text-gray-700">{vente.total} €</p>
      </div>
    </div>
  );
}

export default VenteDetail;
