import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertBottomLeft from "../../components/AlertBottomLeft";

function AchatAddModal({ isOpen, onClose, onAchatAdded }) {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const URL = import.meta.env.VITE_URL_API;
  // Alert state (centralisé)
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const paginatedProduits = filteredProduits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${URL}/api/fournisseurs`)
        .then((res) => setFournisseurs(res.data))
        .catch((err) => {
          setAlertMessage("Erreur chargement fournisseurs : " + err.message);
          setAlertType("error");
        });

      axios
        .get(`${URL}/api/produits`)
        .then((res) => {
          setProduits(res.data);
          setFilteredProduits(res.data);
        })
        .catch((err) => {
          setAlertMessage("Erreur chargement produits : " + err.message);
          setAlertType("error");
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = produits.filter((p) =>
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
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSelectedProducts((prev) => {
        const index = prev.findIndex((p) => p.id === productId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].quantite = quantity;
          return updated;
        } else {
          const product = produits.find((p) => p.id === productId);
          return [
            ...prev,
            {
              id: productId,
              quantite: quantity,
              prix: product.prix_achat,
              nom: product.nom,
            },
          ];
        }
      });
    }
  };

  useEffect(() => {
    setTotal(selectedProducts.reduce((acc, p) => acc + p.quantite * p.prix, 0));
  }, [selectedProducts]);

  const handleSubmit = () => {
    if (!selectedFournisseur) {
      setAlertMessage("Sélectionnez un fournisseur");
      setAlertType("error");
      return;
    }

    if (selectedProducts.length === 0) {
      setAlertMessage("Ajoutez des produits");
      setAlertType("error");
      return;
    }

    const achatData = {
      fournisseur_id: selectedFournisseur,
      date_achat: new Date().toISOString(),
      total,
      produits: selectedProducts.map((p) => ({
        produit_id: p.id,
        quantite: p.quantite,
        prix_unitaire: p.prix,
        total: p.quantite * p.prix,
      })),
    };

    axios
      .post(`${URL}/api/achats`, achatData)
      .then(() => {
        setAlertMessage("Achat ajouté avec succès !");
        setAlertType("success");
        setSelectedFournisseur("");
        setSelectedProducts([]);
        setTotal(0);
        setSearchTerm("");
        if (onAchatAdded) onAchatAdded();
        setTimeout(() => {
          onClose();
        }, 1500);
      })
      .catch((err) => {
        setAlertMessage("Erreur ajout : " + err.message);
        setAlertType("error");
      });
  };
  
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const removeFromCart = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center overflow-y-auto">
        <div className="bg-white w-full max-w-6xl p-6 rounded-lg shadow-lg relative animate-fade-in max-h-screen overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
          >
            &times;
          </button>
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Ajouter un Achat
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium">Fournisseur :</label>
              <select
                value={selectedFournisseur}
                onChange={(e) => setSelectedFournisseur(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Rechercher un produit :
              </label>
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
                {paginatedProduits.map((p) => (
                  <div
                    key={p.id}
                    className="border rounded-lg p-4 shadow hover:shadow-lg transition"
                  >
                    {/* Image du produit */}
                    {p.image_path && (
                      <img
                        src={`${URL}${p.image_path}`}
                        alt={p.nom}
                        className="w-full h-32 object-cover mb-2 rounded"
                      />
                    )}

                    <h3 className="font-semibold text-gray-800">{p.nom}</h3>
                    <p className="text-gray-600 text-sm">
                      Prix Achat : {p.prix_achat} Ar
                    </p>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantité"
                      onChange={(e) =>
                        handleProductChange(p.id, parseInt(e.target.value) || 0)
                      }
                      className="w-full mt-2 p-2 border rounded"
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Préc.
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Suiv.
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Panier</h2>
              <div className="border rounded p-4 max-h-96 overflow-y-auto space-y-3">
                {selectedProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Aucun produit sélectionné.
                  </p>
                ) : (
                  selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-semibold">{p.nom}</p>
                        <p className="text-sm text-gray-600">
                          {p.quantite} x {p.prix} Ar
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
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
              Valider l'Achat
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Affichage centralisé des messages */}
      <AlertBottomLeft message={alertMessage} type={alertType} />
    </>
  );
}

export default AchatAddModal;
