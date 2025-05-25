import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Layouts/Sidebar";

function AchatAdd({ onAchatAdded }) {
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
    axios
      .get("http://localhost:9000/api/produits")
      .then((response) => {
        setProduits(response.data);
        setFilteredProduits(response.data);
      })
      .catch((err) => setError(err.message));

    axios
      .get("http://localhost:9000/api/fournisseurs")
      .then((response) => setFournisseurs(response.data))
      .catch((err) => setError(err.message));
  }, []);

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
  const currentProduits = filteredProduits.slice(
    indexOfFirstProduit,
    indexOfLastProduit
  );
  const totalPages = Math.ceil(filteredProduits.length / produitsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleProductChange = (productId, quantity) => {
    if (isNaN(quantity) || quantity <= 0) {
      setSelectedProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } else {
      setSelectedProducts((prevProducts) => {
        const productIndex = prevProducts.findIndex(
          (item) => item.id === productId
        );
        if (productIndex !== -1) {
          const updatedProducts = [...prevProducts];
          updatedProducts[productIndex].quantity = quantity;
          return updatedProducts;
        } else {
          const product = produits.find((p) => p.id === productId);
          return [
            ...prevProducts,
            { id: productId, quantity, price: product.prix_achat },
          ];
        }
      });
    }
  };

  useEffect(() => {
    updateTotal(selectedProducts);
  }, [selectedProducts]);

  const updateTotal = (products) => {
    let newTotal = 0;
    products.forEach((product) => {
      if (product.quantity > 0 && !isNaN(product.quantity)) {
        newTotal += product.quantity * product.price;
      }
    });
    setTotal(newTotal);
  };

  const handleSubmit = () => {
    if (!selectedFournisseur) {
      setError("Veuillez sélectionner un fournisseur");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Veuillez ajouter des produits à l'achat");
      return;
    }

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

    axios
      .post("http://localhost:9000/api/achats", achatData)
      .then((response) => {
        setSuccess("Achat ajouté avec succès !");
        setTimeout(() => setSuccess(null), 4000);

        setSelectedFournisseur("");
        setSelectedProducts([]);
        setTotal(0);
        setSearchTerm("");

        if (onAchatAdded) onAchatAdded();
      })
      .catch((err) => {
        setError("Erreur lors de l'ajout de l'achat: " + err.message);
        console.error("Erreur lors de l'ajout de l'achat", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Ajouter un Achat
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="fournisseur"
          className="block text-sm font-medium text-gray-700"
        >
          Fournisseur :
        </label>
        <select
          id="fournisseur"
          value={selectedFournisseur}
          onChange={(e) => setSelectedFournisseur(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-2"
        >
          <option value="">Sélectionner un fournisseur</option>
          {fournisseurs.map((fournisseur) => (
            <option key={fournisseur.id} value={fournisseur.id}>
              {fournisseur.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700"
        >
          Rechercher un produit :
        </label>
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
        {currentProduits.map((produit) => (
          <div
            key={produit.id}
            className="flex items-center justify-between mb-4 border-b pb-4"
          >
            <div>
              <h4 className="text-lg font-medium text-gray-700">
                {produit.nom}
              </h4>
              <p className="text-sm text-gray-500">
                Prix: {produit.prix_achat} Ariary
              </p>
            </div>
            <div className="w-28">
              <input
                type="number"
                min="1"
                placeholder="Quantité"
                onChange={(e) =>
                  handleProductChange(
                    produit.id,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition duration-200"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition duration-200"
          >
            Suivant
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Total : {total} Ariary
        </h3>
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Traitement en cours..." : "Valider l'Achat"}
        </button>
      </div>
    </div>
  );
}

export default AchatAdd;
