import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Layouts/Sidebar';
import { useNavigate } from 'react-router-dom';

function VenteAdd({ onVenteAdded }) {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const paginatedProduits = filteredProduits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    axios.get('http://localhost:9000/api/produits')
      .then(response => {
        setProduits(response.data);
        setFilteredProduits(response.data);
      })
      .catch(error => setError('Erreur lors du chargement des produits : ' + error.message));

    axios.get('http://localhost:9000/api/clients')
      .then(response => setClients(response.data))
      .catch(error => setError('Erreur lors du chargement des clients : ' + error.message));
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = produits.filter(produit =>
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProduits(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProduits(produits);
    }
  }, [searchTerm, produits]);

  const handleProductChange = (productId, quantity) => {
    if (quantity <= 0 || isNaN(quantity)) {
      setSelectedProducts(prev =>
        prev.filter(product => product.id !== productId)
      );
    } else {
      setSelectedProducts(prev => {
        const index = prev.findIndex(item => item.id === productId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].quantity = quantity;
          return updated;
        } else {
          const product = produits.find(p => p.id === productId);
          return [...prev, { id: productId, quantity, price: product.prix_vente }];
        }
      });
    }
  };

  useEffect(() => {
    updateTotal(selectedProducts);
  }, [selectedProducts]);

  const updateTotal = (products) => {
    const newTotal = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);
    setTotal(newTotal);
  };

  const handleSubmit = () => {
    if (!selectedClient) {
      return setError('Veuillez sélectionner un client');
    }
    if (selectedProducts.length === 0) {
      return setError('Veuillez ajouter des produits');
    }
    if (selectedProducts.some(p => p.quantity <= 0)) {
      return setError('Les quantités des produits doivent être supérieures à zéro');
    }

    setError(null);
    setSuccessMessage(null);

    const venteData = {
      client_id: selectedClient,
      total,
      date_vente: new Date().toISOString(),
      produits: selectedProducts.map(p => ({
        produit_id: p.id,
        quantite: p.quantity,
        prix_unitaire: p.price,
        total: p.quantity * p.price
      }))
    };

    axios.post('http://localhost:9000/api/ventes', venteData)
      .then(response => {
        setSuccessMessage('Vente réussie !');
        setSelectedClient('');
        setSelectedProducts([]);
        setTotal(0);
        setSearchTerm('');
        if (onVenteAdded) onVenteAdded();
        // navigate("/vente");
      })
      .catch(error => {
        setError('Erreur lors de l\'ajout de la vente : ' + error.message);
        console.error(error);
      });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Ajouter une Vente</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{successMessage}</div>}

      <div className="mb-4">
        <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client :</label>
        <select
          id="client"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-2"
        >
          <option value="">Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.nom}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Rechercher un produit :</label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tapez pour rechercher..."
          className="w-full p-2 border border-gray-300 rounded-lg mt-2"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Produits</h3>
        {paginatedProduits.map(produit => (
          <div key={produit.id} className="flex items-center justify-between mb-4 border-b pb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-700">{produit.nom}</h4>
              <p className="text-sm text-gray-500">Prix: {produit.prix_vente} Ar</p>
            </div>
            <div className="w-28">
              <input
                type="number"
                min="1"
                placeholder="Quantité"
                onChange={(e) => handleProductChange(produit.id, parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Total : {total} Ar</h3>
      </div>
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Valider la Vente
        </button>
      </div>
    </div>
  );
}

export default VenteAdd;
