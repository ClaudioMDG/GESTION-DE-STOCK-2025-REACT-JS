import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';

function ProduitUpdate() {
  const { id } = useParams(); // Récupère l'ID du produit à partir de l'URL
  const navigate = useNavigate(); // Pour la redirection après mise à jour

  const [produit, setProduit] = useState({
    nom: '',
    description: '',
    prix_achat: '',
    prix_vente: '',
    quantite_en_stock: '',
    seuil_alerte: '',
    categorie_id: '',
    fournisseur_id: ''
  });

  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement

  // Charger les données du produit à mettre à jour
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger le produit
        const produitResponse = await fetch(`http://localhost:9000/api/produits/${id}`);
        const produitData = await produitResponse.json();
        setProduit(produitData);

        // Charger les catégories
        const categoriesResponse = await fetch('http://localhost:9000/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Charger les fournisseurs
        const fournisseursResponse = await fetch('http://localhost:9000/api/fournisseurs');
        const fournisseursData = await fournisseursResponse.json();
        setFournisseurs(fournisseursData);

        setLoading(false); // Lorsque tout est chargé
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fonction pour mettre à jour le produit
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`http://localhost:9000/api/produits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produit),
    })
      .then((response) => response.json())
      .then(() => {
        navigate('/produitList'); // Rediriger vers la liste des produits
        console.log('Produit mis à jour');
      })
      .catch((error) => console.error('Erreur lors de la mise à jour du produit:', error));
  };

  // Gérer le changement des champs de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduit((prevProduit) => ({
      ...prevProduit,
      [name]: value,
    }));
  };

  // Afficher un message de chargement si les données sont en cours de récupération
  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mise à Jour du Produit</h2>

          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={produit.nom}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <input
                  type="text"
                  name="description"
                  value={produit.description}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Prix d'Achat</label>
                <input
                  type="number"
                  name="prix_achat"
                  value={produit.prix_achat}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Prix de Vente</label>
                <input
                  type="number"
                  name="prix_vente"
                  value={produit.prix_vente}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Quantité en Stock</label>
                <input
                  type="number"
                  name="quantite_en_stock"
                  value={produit.quantite_en_stock}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Seuil Alerte</label>
                <input
                  type="number"
                  name="seuil_alerte"
                  value={produit.seuil_alerte}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Catégorie</label>
                <select
                  name="categorie_id"
                  value={produit.categorie_id}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Fournisseur</label>
                <select
                  name="fournisseur_id"
                  value={produit.fournisseur_id}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProduitUpdate;
