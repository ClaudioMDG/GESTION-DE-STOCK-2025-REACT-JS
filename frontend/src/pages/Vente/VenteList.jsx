import React, { useState, useEffect } from 'react';

function VenteList({ refresh }) {
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVente, setSelectedVente] = useState(null);
  const [detailsProduits, setDetailsProduits] = useState([]);
  // Recherche & filtres
  const [searchClient, setSearchClient] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVentes = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/ventes');
        if (!response.ok) throw new Error('Erreur lors du chargement des ventes');
        const data = await response.json();
        setVentes(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/clients');
        if (!response.ok) throw new Error('Erreur lors du chargement des clients');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVentes();
    fetchClients();
  }, [refresh]);

  const getClientNameById = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.nom.toLowerCase() : 'Client inconnu';
  };

  const handleDetailsClick = async (venteId) => {
    try {
      const response = await fetch(`http://localhost:9000/api/ventes/${venteId}/details`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des détails de la vente');
      const details = await response.json();
      setDetailsProduits(details);
      const venteDetails = ventes.find(vente => vente.id === venteId);
      setSelectedVente(venteDetails);
    } catch (error) {
      setError(error.message);
    }
  };

  const closeDetails = () => {
    setSelectedVente(null);
    setDetailsProduits([]);
  };

  // Filtrage
  const filteredVentes = ventes.filter(vente => {
    const clientName = getClientNameById(vente.client_id);
    const matchSearch = clientName.includes(searchClient.toLowerCase());

    const venteDate = new Date(vente.date_vente);
    const matchDateDebut = dateDebut ? venteDate >= new Date(dateDebut) : true;
    const matchDateFin = dateFin ? venteDate <= new Date(dateFin) : true;

    return matchSearch && matchDateDebut && matchDateFin;
  });

  const totalPages = Math.ceil(filteredVentes.length / itemsPerPage);
  const paginatedVentes = filteredVentes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Liste des Ventes</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recherche client</label>
          <input
            type="text"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            placeholder="Nom du client"
            className="px-3 py-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Table des ventes */}
      <table className="w-full table-auto mb-6">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Client</th>
            <th className="px-4 py-2 text-left">Total</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedVentes.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4">Aucune vente trouvée</td>
            </tr>
          ) : (
            paginatedVentes.map(vente => (
              <tr key={vente.id}>
                <td className="px-4 py-2">{new Date(vente.date_vente).toLocaleDateString()}</td>
                <td className="px-4 py-2">{getClientNameById(vente.client_id)}</td>
                <td className="px-4 py-2">{vente.total} Ariary</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDetailsClick(vente.id)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selectedVente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 relative">
            <div className="p-6">
              <button
                onClick={closeDetails}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 text-xl hover:bg-red-700"
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-2">Détails de la Vente</h3>
              <p><strong>Date :</strong> {new Date(selectedVente.date_vente).toLocaleDateString()}</p>
              <p><strong>Client :</strong> {getClientNameById(selectedVente.client_id)}</p>
              <p><strong>Total :</strong> {selectedVente.total} Ar</p>
              <h4 className="text-lg font-semibold mt-4">Produits :</h4>
              <ul className="list-disc pl-5">
                {detailsProduits.length > 0 ? (
                  detailsProduits.map((produit, index) => (
                    <li key={index}>
                      {produit.nom} - {produit.quantite} x {produit.prix_unitaire} Ar = {produit.total} Ar
                    </li>
                  ))
                ) : (
                  <li>Aucun produit trouvé.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenteList;
