import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  PlusCircle,
  Type,
  FileText,
  DollarSign,
  Package,
  TriangleAlert,
  Layers,
  Truck,
} from "lucide-react";
import AlertBottomLeft from "../../components/AlertBottomLeft";

function ProduitEditModal({ isOpen, onClose, produit, onSuccess }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [quantiteEnStock, setQuantiteEnStock] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");

  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produitsExistants, setProduitsExistants] = useState([]);
  const URL = import.meta.env.VITE_URL_API;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (isOpen) {
      setImage(null);
      setMessage(null); // ✅ Ajouté
      setMessageType(null); // ✅ Ajouté
    }
  }, [isOpen]);
  
  

  useEffect(() => {
    if (!isOpen || !produit) return;

    setNom(produit.nom || "");
    setDescription(produit.description || "");
    setPrixAchat(produit.prix_achat || "");
    setPrixVente(produit.prix_vente || "");
    setQuantiteEnStock(produit.quantite_en_stock || "");
    setSeuilAlerte(produit.seuil_alerte || "");
    setCategorieId(produit.categorie_id || "");
    setFournisseurId(produit.fournisseur_id || "");

    axios
      .get(`${URL}/api/categories`)
      .then((res) => setCategories(res.data))
      .catch(() => {
        setMessage("Erreur chargement catégories");
        setMessageType("error");
      });

    axios
      .get(`${URL}/api/fournisseurs`)
      .then((res) => setFournisseurs(res.data))
      .catch(() => {
        setMessage("Erreur chargement fournisseurs");
        setMessageType("error");
      });

    axios
      .get(`${URL}/api/produits`)
      .then((res) => setProduitsExistants(res.data))
      .catch(() => {
        setMessage("Erreur chargement produits existants");
        setMessageType("error");
      });
  }, [isOpen, produit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nom ||
      !description ||
      !prixAchat ||
      !prixVente ||
      !quantiteEnStock ||
      !seuilAlerte ||
      !categorieId ||
      !fournisseurId
    ) {
      setMessage("Veuillez remplir tous les champs.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const nomExiste = produitsExistants.some(
      (p) =>
        p.nom.trim().toLowerCase() === nom.trim().toLowerCase() &&
        p.id !== produit.id
    );

    if (nomExiste) {
      setMessage(
        "Ce nom de produit existe déjà. Veuillez en choisir un autre."
      );
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseFloat(prixVente) <= parseFloat(prixAchat)) {
      setMessage(
        "Le prix de vente ne peut pas être inférieur ou égal au prix d'achat."
      );
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseInt(quantiteEnStock) <= 0) {
      setMessage(
        "La quantité en stock ne peut pas être égale ou inférieure à zéro."
      );
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (parseInt(seuilAlerte) > parseInt(quantiteEnStock)) {
      setMessage(
        "Le seuil d'alerte ne peut pas être supérieur à la quantité en stock."
      );
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const data = {
      nom,
      description,
      prix_achat: parseFloat(prixAchat),
      prix_vente: parseFloat(prixVente),
      quantite_en_stock: parseInt(quantiteEnStock),
      seuil_alerte: parseInt(seuilAlerte),
      categorie_id: parseInt(categorieId),
      fournisseur_id: parseInt(fournisseurId),
    };

    axios
      .put(`${URL}/api/produits/${produit.id}`, data)
      .then(() => {
        setMessage("Produit mis à jour avec succès !");
        setMessageType("success");
        onSuccess();
        onClose();
      })
      .catch(() => {
        setMessage("Erreur lors de la mise à jour du produit.");
        setMessageType("error");
        setTimeout(() => setMessage(null), 3000);
      });
  };

  if (!isOpen) return null;

  return (
    <>
      {message && <AlertBottomLeft message={message} type={messageType} />}
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-4xl rounded-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-700 hover:text-red-600"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-4">Modifier le Produit</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Inputs ici... (inchangés) */}
            {/* ... */}
            <div className="flex items-center border p-2 rounded">
              <Type className="mr-2 text-gray-400" size={20} />
              <input
                placeholder="Nom du produit"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border p-2 rounded">
              <DollarSign className="mr-2 text-gray-400" size={20} />
              <input
                type="number"
                placeholder="Prix Achat"
                value={prixAchat}
                onChange={(e) => setPrixAchat(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border p-2 rounded">
              <DollarSign className="mr-2 text-gray-400" size={20} />
              <input
                type="number"
                placeholder="Prix Vente"
                value={prixVente}
                onChange={(e) => setPrixVente(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border p-2 rounded">
              <Package className="mr-2 text-gray-400" size={20} />
              <input
                type="number"
                placeholder="Quantité en stock"
                value={quantiteEnStock}
                onChange={(e) => setQuantiteEnStock(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border p-2 rounded">
              <TriangleAlert className="mr-2 text-gray-400" size={20} />
              <input
                type="number"
                placeholder="Seuil alerte"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border p-2 rounded">
              <Layers className="mr-2 text-gray-400" size={20} />
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full outline-none bg-transparent"
              >
                <option value="">Choisir Catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center border p-2 rounded">
              <Truck className="mr-2 text-gray-400" size={20} />
              <select
                value={fournisseurId}
                onChange={(e) => setFournisseurId(e.target.value)}
                className="w-full outline-none bg-transparent"
              >
                <option value="">Choisir Fournisseur</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start border p-2 rounded col-span-2">
              <FileText className="mr-2 text-gray-400 mt-1" size={20} />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full outline-none resize-none"
              />
            </div>
            <div className="flex items-center border p-2 rounded col-span-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full"
              />
            </div>

            <div className="col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProduitEditModal;
