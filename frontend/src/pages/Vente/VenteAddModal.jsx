import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VenteAddModal({ isOpen, onClose, onVenteAdded }) {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const URL = import.meta.env.VITE_URL_API;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const paginatedProduits = filteredProduits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${URL}/api/produits`)
        .then(response => {
          setProduits(response.data);
          setFilteredProduits(response.data);
        })
        .catch(error => setError('Erreur produits : ' + error.message));

      axios.get(`${URL}/api/clients`)
        .then(response => setClients(response.data))
        .catch(error => setError('Erreur clients : ' + error.message));
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = produits.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProduits(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProduits(produits);
    }
  }, [searchTerm, produits]);

  const handleProductChange = (productId, quantity) => {
    if (quantity <= 0 || isNaN(quantity)) {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(prev => {
        const index = prev.findIndex(p => p.id === productId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].quantity = quantity;
          return updated;
        } else {
          const product = produits.find(p => p.id === productId);
          return [...prev, { id: productId, quantity, price: product.prix_vente, name: product.nom }];
        }
      });
    }
  };

  useEffect(() => {
    setTotal(selectedProducts.reduce((acc, p) => acc + (p.quantity * p.price), 0));
  }, [selectedProducts]);

  const handleSubmit = () => {
    if (!selectedClient) return setError('Sélectionner un client');
    if (selectedProducts.length === 0) return setError('Ajouter des produits');

    const venteData = {
      client_id: selectedClient,
      total,
      date_vente: new Date().toISOString(),
      produits: selectedProducts.map(p => ({
        produit_id: p.id,
        quantite: p.quantity,
        prix_unitaire: p.price,
        total: p.quantity * p.price,
      }))
    };

    axios.post(`${URL}/api/ventes`, venteData)
      .then(() => {
        setSuccessMessage('Vente réussie !');
        setSelectedClient('');
        setSelectedProducts([]);
        setTotal(0);
        setSearchTerm('');
        if (onVenteAdded) onVenteAdded();
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1500);
      })
      .catch(error => setError('Erreur ajout : ' + error.message));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const removeFromCart = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-6xl p-6 rounded-lg shadow-lg relative animate-fade-in max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Ajouter une Vente</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium">Client :</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            >
              <option value="">Sélectionner un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Rechercher un produit :</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Produits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedProduits.map(p => (
                <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                  <h3 className="font-semibold text-gray-800">{p.nom}</h3>
                  <p className="text-gray-600 text-sm">Prix : {p.prix_vente} Ar</p>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantité"
                    onChange={(e) => handleProductChange(p.id, parseInt(e.target.value) || 0)}
                    className="w-full mt-2 p-2 border rounded"
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded">Préc.</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded">Suiv.</button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Panier</h2>
            <div className="border rounded p-4 max-h-96 overflow-y-auto space-y-3">
              {selectedProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun produit sélectionné.</p>
              ) : (
                selectedProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.quantity} x {p.price} Ar</p>
                    </div>
                    <button onClick={() => removeFromCart(p.id)} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-center font-bold text-lg text-gray-800">
              Total : {total} Ar
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
          >
            Valider la Vente
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenteAddModal;
