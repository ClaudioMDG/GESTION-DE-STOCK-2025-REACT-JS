import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, PlusCircle, DollarSign, Package, TriangleAlert, Layers, Truck, Type, FileText, Image as ImageIcon } from 'lucide-react';
import AlertBottomLeft from '../../components/AlertBottomLeft';

function ProduitAddModal({ isOpen, onClose, onSuccess }) {
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
  const [produitsExistants, setProduitsExistants] = useState([]);
  const URL = import.meta.env.VITE_URL_API;
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (!isOpen) return;

    axios.get(`${URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(() => setMessage("Erreur chargement catégories"));

    axios.get(`${URL}/api/fournisseurs`)
      .then(res => setFournisseurs(res.data))
      .catch(() => setMessage("Erreur chargement fournisseurs"));

    axios.get(`${URL}/api/produits`)
      .then(res => setProduitsExistants(res.data))
      .catch(() => setMessage("Erreur chargement produits existants"));
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations (idem à ce que tu as déjà)
    const nomExiste = produitsExistants.some(
      p => p.nom.trim().toLowerCase() === nom.trim().toLowerCase()
    );

    if (nomExiste) {
      setMessage("Ce nom de produit existe déjà. Veuillez en choisir un autre.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!nom || !description || !prixAchat || !prixVente || !quantiteEnStock || !seuilAlerte || !categorieId || !fournisseurId) {
      setMessage("Veuillez remplir tous les champs.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseFloat(prixVente) <= parseFloat(prixAchat)) {
      setMessage("Le prix de vente ne peut pas être inférieur ou égal au prix d'achat.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseInt(quantiteEnStock) <= 0) {
      setMessage("La quantité en stock ne peut pas être égale ou inférieure à zéro.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseInt(seuilAlerte) > parseInt(quantiteEnStock)) {
      setMessage("Le seuil d'alerte ne peut pas être supérieur à la quantité en stock.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Création FormData pour envoyer fichier + données
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('description', description);
    formData.append('prix_achat', parseFloat(prixAchat));
    formData.append('prix_vente', parseFloat(prixVente));
    formData.append('quantite_en_stock', parseInt(quantiteEnStock));
    formData.append('seuil_alerte', parseInt(seuilAlerte));
    formData.append('categorie_id', parseInt(categorieId));
    formData.append('fournisseur_id', parseInt(fournisseurId));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    axios.post(`${URL}/api/produits`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        setMessage("Produit ajouté avec succès !");
        setMessageType("success");
        onSuccess();
        onClose();
      })
      .catch(() => {
        setMessage("Erreur lors de l'ajout du produit.");
        setMessageType("error");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-700 hover:text-red-600">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Ajouter un Produit</h2>

        {message && (
          <AlertBottomLeft message={message} type={messageType} />
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <div className="flex items-center border p-2 rounded">
            <Type className="mr-2 text-gray-400" size={20} />
            <input
              placeholder="Nom du produit"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Prix Achat */}
          <div className="flex items-center border p-2 rounded">
            <DollarSign className="mr-2 text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Prix Achat"
              value={prixAchat}
              onChange={e => setPrixAchat(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Prix Vente */}
          <div className="flex items-center border p-2 rounded">
            <DollarSign className="mr-2 text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Prix Vente"
              value={prixVente}
              onChange={e => setPrixVente(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Quantité */}
          <div className="flex items-center border p-2 rounded">
            <Package className="mr-2 text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Quantité en stock"
              value={quantiteEnStock}
              onChange={e => setQuantiteEnStock(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Seuil Alerte */}
          <div className="flex items-center border p-2 rounded">
            <TriangleAlert className="mr-2 text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Seuil alerte"
              value={seuilAlerte}
              onChange={e => setSeuilAlerte(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Catégorie */}
          <div className="flex items-center border p-2 rounded">
            <Layers className="mr-2 text-gray-400" size={20} />
            <select
              value={categorieId}
              onChange={e => setCategorieId(e.target.value)}
              className="w-full outline-none bg-transparent"
            >
              <option value="">Choisir Catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Fournisseur */}
          <div className="flex items-center border p-2 rounded">
            <Truck className="mr-2 text-gray-400" size={20} />
            <select
              value={fournisseurId}
              onChange={e => setFournisseurId(e.target.value)}
              className="w-full outline-none bg-transparent"
            >
              <option value="">Choisir Fournisseur</option>
              {fournisseurs.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex items-start border p-2 rounded col-span-2">
            <FileText className="mr-2 text-gray-400 mt-1" size={20} />
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full outline-none resize-none"
            />
          </div>

          {/* Image Upload */}
<div className="flex flex-col col-span-2">
  {!imagePreview ? (
    <label className="flex items-center gap-2 text-gray-600 cursor-pointer border border-gray-300 rounded p-2 hover:bg-gray-100">
      <ImageIcon size={20} />
      <span>Sélectionner une image</span>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </label>
  ) : (
    <div className="relative mt-2 w-fit">
      <img
        src={imagePreview}
        alt="Preview"
        className="max-h-40 object-contain rounded border"
      />
      <button
        type="button"
        onClick={handleRemoveImage}
        className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100"
        title="Supprimer l'image"
      >
        <X size={16} className="text-red-600" />
      </button>
    </div>
  )}
</div>


          {/* Submit */}
          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProduitAddModal;
