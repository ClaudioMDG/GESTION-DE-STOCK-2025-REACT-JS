import React, { useState, useEffect } from "react";
import axios from "axios";

function AchatModal({ isOpen, onClose, onAchatAdded }) {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const produitsPerPage = 5;

  useEffect(() => {
    if (!isOpen) return;

    axios.get("http://localhost:9000/api/produits")
      .then((res) => {
        setProduits(res.data);
        setFilteredProduits(res.data);
      })
      .catch((err) => setError(err.message));

    axios.get("http://localhost:9000/api/fournisseurs")
      .then((res) => setFournisseurs(res.data))
      .catch((err) => setError(err.message));
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = produits.filter((produit) =>
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProduits(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProduits(produits);
    }
  }, [searchTerm, produits]);

  const indexOfLastProduit = currentPage * produitsPerPage;
  const indexOfFirstProduit = indexOfLastProduit - produitsPerPage;
  const currentProduits = filteredProduits.slice(indexOfFirstProduit, indexOfLastProduit);
  const totalPages = Math.ceil(filteredProduits.length / produitsPerPage);

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleProductChange = (productId, quantity) => {
    if (isNaN(quantity) || quantity <= 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSelectedProducts((prev) => {
        const index = prev.findIndex((item) => item.id === productId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].quantity = quantity;
          return updated;
        } else {
          const produit = produits.find((p) => p.id === productId);
          return [...prev, { id: productId, quantity, price: produit.prix_achat }];
        }
      });
    }
  };

  useEffect(() => {
    const newTotal = selectedProducts.reduce((acc, p) => acc + p.quantity * p.price, 0);
    setTotal(newTotal);
  }, [selectedProducts]);

  const handleSubmit = () => {
    if (!selectedFournisseur) return setError("Veuillez sélectionner un fournisseur");
    if (selectedProducts.length === 0) return setError("Veuillez ajouter des produits à l'achat");

    setError(null);
    setLoading(true);

    const achatData = {
      fournisseur_id: selectedFournisseur,
      total,
      date_achat: new Date().toISOString(),
      produits: selectedProducts.map((p) => ({
        produit_id: p.id,
        quantite: p.quantity,
        prix_unitaire: p.price,
        total: p.quantity * p.price,
      })),
    };

    axios.post("http://localhost:9000/api/achats", achatData)
      .then(() => {
        setSuccess("Achat ajouté avec succès !");
        setTimeout(() => {
          setSuccess(null);
          onClose();
          if (onAchatAdded) onAchatAdded();
        }, 2000);

        setSelectedFournisseur("");
        setSelectedProducts([]);
        setTotal(0);
        setSearchTerm("");
      })
      .catch((err) => setError("Erreur: " + err.message))
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">Ajouter un Achat</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-3 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 mb-3 rounded">{success}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fournisseur :</label>
          <select
            value={selectedFournisseur}
            onChange={(e) => setSelectedFournisseur(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          >
            <option value="">Sélectionner un fournisseur</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Rechercher un produit :</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Produits</h3>
          {currentProduits.map((produit) => (
            <div key={produit.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="text-sm font-semibold">{produit.nom}</p>
                <p className="text-xs text-gray-500">Prix: {produit.prix_achat} Ariary</p>
              </div>
              <input
                type="number"
                min="1"
                placeholder="Quantité"
                className="w-24 p-1 border border-gray-300 rounded"
                onChange={(e) => handleProductChange(produit.id, parseInt(e.target.value))}
              />
            </div>
          ))}

          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Précédent
            </button>
            <span>Page {currentPage} sur {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        <div className="mt-6 mb-4 text-right font-semibold text-lg">
          Total : {total} Ariary
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Traitement..." : "Valider l'Achat"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AchatModal;
