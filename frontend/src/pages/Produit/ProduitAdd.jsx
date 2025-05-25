import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';

function ProduitAdd() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prixAchat, setPrixAchat] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [quantiteEnStock, setQuantiteEnStock] = useState('');
  const [seuilAlerte, setSeuilAlerte] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [fournisseurId, setFournisseurId] = useState('');

  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9000/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error('Erreur chargement catégories:', error);
        setMessage("Erreur de chargement des catégories.");
        setMessageType("error");
      });

    fetch('http://localhost:9000/api/fournisseurs')
      .then((response) => response.json())
      .then((data) => setFournisseurs(data))
      .catch((error) => {
        console.error('Erreur chargement fournisseurs:', error);
        setMessage("Erreur de chargement des fournisseurs.");
        setMessageType("error");
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation simple
    if (!nom || !description || !prixAchat || !prixVente || !quantiteEnStock || !seuilAlerte || !categorieId || !fournisseurId) {
      setMessage("Veuillez remplir tous les champs.");
      setMessageType("error");
      return;
    }

    const produitData = {
      nom,
      description,
      prix_achat: parseFloat(prixAchat),
      prix_vente: parseFloat(prixVente),
      quantite_en_stock: parseInt(quantiteEnStock, 10),
      seuil_alerte: parseInt(seuilAlerte, 10),
      categorie_id: parseInt(categorieId, 10),
      fournisseur_id: parseInt(fournisseurId, 10),
    };

    fetch('http://localhost:9000/api/produits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produitData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur serveur");
        }
        return response.json();
      })
      .then((data) => {
        setMessage("Produit ajouté avec succès !");
        setMessageType("success");
        setTimeout(() => navigate('/produitList'), 1500); // redirection après un petit délai
      })
      .catch((error) => {
        console.error('Erreur ajout produit:', error);
        setMessage("Erreur lors de l'ajout du produit. Veuillez réessayer.");
        setMessageType("error");
      });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Ajouter un Nouveau Produit</h2>

          {message && (
            <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="nom">Nom du Produit</label>
                <input
                  type="text"
                  id="nom"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-600" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="prix_achat">Prix d'Achat</label>
                <input
                  type="number"
                  id="prix_achat"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={prixAchat}
                  onChange={(e) => setPrixAchat(e.target.value)}
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="prix_vente">Prix de Vente</label>
                <input
                  type="number"
                  id="prix_vente"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="quantite_en_stock">Quantité en Stock</label>
                <input
                  type="number"
                  id="quantite_en_stock"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={quantiteEnStock}
                  onChange={(e) => setQuantiteEnStock(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="seuil_alerte">Seuil d'Alerte</label>
                <input
                  type="number"
                  id="seuil_alerte"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={seuilAlerte}
                  onChange={(e) => setSeuilAlerte(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="categorie_id">Catégorie</label>
                <select
                  id="categorie_id"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={categorieId}
                  onChange={(e) => setCategorieId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="fournisseur_id">Fournisseur</label>
                <select
                  id="fournisseur_id"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                  value={fournisseurId}
                  onChange={(e) => setFournisseurId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((frs) => (
                    <option key={frs.id} value={frs.id}>{frs.nom}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-4 flex justify-end">
                <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Ajouter le Produit
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ProduitAdd;
