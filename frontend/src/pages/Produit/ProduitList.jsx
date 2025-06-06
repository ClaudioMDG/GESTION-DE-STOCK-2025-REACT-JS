import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  FileDown,
  FileUp,
  Clock3,
  Search,
  Tag,
  Truck,
  AlertTriangle,
  Info,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Sidebar from "../Layouts/Sidebar";
import AlertBottomLeft from "../../components/AlertBottomLeft";
import ProduitAddModal from "./ProduitAddModal";
import ProduitEditModal from "./ProduitEditModal";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProduitDetailModal from "./ProduitDetailModal"; // Ajoutez ceci

function ProduitList() {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("nom");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const produitsParPage = 10;
  const URL = import.meta.env.VITE_URL_API;
  const [categorieFiltre, setCategorieFiltre] = useState("");
  const [fournisseurFiltre, setFournisseurFiltre] = useState("");
  const [seuilFiltre, setSeuilFiltre] = useState(""); // "haut", "bas", ou ""

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [produitDetail, setProduitDetail] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const indexOfLast = currentPage * produitsParPage;
  const indexOfFirst = indexOfLast - produitsParPage;
  const currentProduits = filteredProduits.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filtrerEtTrier();
  }, [
    produits,
    search,
    sortColumn,
    sortAsc,
    categorieFiltre,
    fournisseurFiltre,
    seuilFiltre,
  ]);
  const fetchData = () => {
    axios.get(`${URL}/api/produits`).then((res) => {
      setProduits(res.data);
    });
    axios.get(`${URL}/api/categories`).then((res) => {
      setCategories(res.data);
    });
    axios.get(`${URL}/api/fournisseurs`).then((res) => {
      setFournisseurs(res.data);
    });
  };
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // yyyy-mm-dd
    const alertsKey = "alertsShown_" + today;
    const alerts = JSON.parse(localStorage.getItem(alertsKey)) || [];

    if (alerts.length < 2) {
      const produitsAlerte = produits.filter(
        (p) => p.quantite_en_stock < p.seuil_alerte
      );

      if (produitsAlerte.length > 0) {
        // Afficher l'alerte
        setAlert({
          message: `${produitsAlerte.length} produit(s) en-dessous du seuil d'alerte.`,
          type: "warning",
        });

        // Enregistrer l'heure de cette alerte
        alerts.push(now.toISOString());
        localStorage.setItem(alertsKey, JSON.stringify(alerts));

        // Supprimer l'alerte après quelques secondes
        setTimeout(() => {
          setAlert(null);
        }, 5000);
      }
    }
  }, [produits]);

  const filtrerEtTrier = () => {
    let filtrés = produits.filter((p) => {
      const matchNom = p.nom.toLowerCase().includes(search.toLowerCase());
      const matchCategorie =
        !categorieFiltre || p.categorie_id === parseInt(categorieFiltre);
      const matchFournisseur =
        !fournisseurFiltre || p.fournisseur_id === parseInt(fournisseurFiltre);
      return matchNom && matchCategorie && matchFournisseur;
    });

    // Filtrage ou tri par seuil
    if (seuilFiltre === "haut") {
      filtrés = filtrés.sort((a, b) => b.seuil_alerte - a.seuil_alerte);
    } else if (seuilFiltre === "bas") {
      filtrés = filtrés.sort((a, b) => a.seuil_alerte - b.seuil_alerte);
    } else {
      filtrés = filtrés.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    setFilteredProduits(filtrés);
  };

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`${URL}/api/produits/${id}`)
      .then(() => {
        setProduits(produits.filter((p) => p.id !== id));
        setAlert({
          message: "Produit supprimé avec succès !",
          type: "success",
        });
        // Réinitialiser l'alerte après 3 secondes
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.status === 400 &&
          err.response.data.message.includes("Impossible de supprimer")
        ) {
          setAlert({
            message: err.response.data.message,
            type: "error",
          });
          // Réinitialiser l'alerte après 3 secondes
          setTimeout(() => {
            setAlert(null);
          }, 3000);
        } else {
          setAlert({
            message: "Une erreur est survenue lors de la suppression.",
            type: "error",
          });
          // Réinitialiser l'alerte après 3 secondes
          setTimeout(() => {
            setAlert(null);
          }, 3000);
        }
      });
  };

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    fetchData();
    setAlert({ message: "Produit ajouté avec succès !", type: "success" });
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchData();
    setAlert({ message: "Produit mis à jour avec succès !", type: "success" });
  };

  const getCategorieName = (id) =>
    categories.find((c) => c.id === id)?.nom || "Inconnu";
  const getFournisseurName = (id) =>
    fournisseurs.find((f) => f.id === id)?.nom || "Inconnu";

  const exportCSV = () => {
    const lignes = [
      [
        "Nom",
        "Description",
        "Prix Achat",
        "Prix Vente",
        "Stock",
        "Seuil",
        "Catégorie",
        "Fournisseur",
      ],
      ...produits.map((p) => [
        p.nom,
        p.description,
        p.prix_achat,
        p.prix_vente,
        p.quantite_en_stock,
        p.seuil_alerte,
        getCategorieName(p.categorie_id),
        getFournisseurName(p.fournisseur_id),
      ]),
    ];
    const csv = lignes.map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produits.csv";
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    setAlert({
      message: `Import de ${file.name} (non implémenté)`,
      type: "info",
    });
  };

  const nbProduits = produits.length;
  const nbStockBas = produits.filter(
    (p) => p.quantite_en_stock < p.seuil_alerte
  ).length;

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Liste des Produits", 14, 22);

    const columns = [
      "Nom",
      "Description",
      "Prix Achat",
      "Prix Vente",
      "Stock",
      "Seuil",
      "Catégorie",
      "Fournisseur",
    ];

    const rows = filteredProduits.map((p) => [
      p.nom,
      p.description,
      p.prix_achat + " Ar",
      p.prix_vente + " Ar",
      p.quantite_en_stock,
      p.seuil_alerte,
      getCategorieName(p.categorie_id),
      getFournisseurName(p.fournisseur_id),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      theme: "striped",
    });

    doc.save("produits.pdf");
  };
  const exportSinglePDF = (produit) => {
    const doc = new jsPDF();

    const exportDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Titre
    doc.setFontSize(16);
    doc.setTextColor("#1565c0");
    doc.text(`Détails du produit : ${produit.nom}`, 14, 20);

    // Date d’exportation
    doc.setFontSize(11);
    doc.setTextColor("#555");
    doc.text(`Exporté le : ${exportDate}`, 14, 27);

    // Détails du produit
    doc.setFontSize(12);
    doc.setTextColor("#000");

    const details = [
      ["Nom", produit.nom],
      ["Description", produit.description],
      ["Prix Achat", produit.prix_achat + " Ar"],
      ["Prix Vente", produit.prix_vente + " Ar"],
      ["Quantité en stock", produit.quantite_en_stock.toString()],
      ["Seuil d'alerte", produit.seuil_alerte.toString()],
      ["Catégorie", getCategorieName(produit.categorie_id)],
      ["Fournisseur", getFournisseurName(produit.fournisseur_id)],
    ];

    // Générer le tableau avec autoTable
    autoTable(doc, {
      startY: 35,
      head: [["Attribut", "Valeur"]],
      body: details,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [33, 150, 243] },
      theme: "grid",
    });

    // Sauvegarder le PDF
    doc.save(`produit_${produit.nom}.pdf`);
  };
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = currentProduits.map((p) => p.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-50 p-4">
        <div className="w-full bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Liste des Produits
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={exportPDF}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                <FileDown size={16} className="inline" />
              </button>

              <label className="cursor-pointer bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                <FileUp size={16} className="inline mr-1" />
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={importCSV}
                />
              </label>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Ajouter
              </button>
            </div>
          </div>

          <ProduitAddModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAddSuccess}
          />

          {/* Statistiques */}
          <div className="mb-4 text-sm text-gray-600">
            Total : <strong>{nbProduits}</strong> produits • Stock bas :{" "}
            <strong>{nbStockBas}</strong>
          </div>

          {/* Recherche */}
          <div className="flex gap-4 mb-4">
            {/* Recherche */}
            <div
              className="flex items-center border rounded px-3 py-2 w-1/4"
              title="Rechercher un produit"
            >
              <Search size={18} className="mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none w-full"
              />
            </div>

            {/* Filtre catégorie */}
            <div
              className="flex items-center border rounded px-3 py-2 w-1/4"
              title="Filtrer par catégorie"
            >
              <Tag size={18} className="mr-2 text-gray-500" />
              <select
                value={categorieFiltre}
                onChange={(e) => setCategorieFiltre(e.target.value)}
                className="outline-none w-full bg-transparent"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre fournisseur */}
            <div
              className="flex items-center border rounded px-3 py-2 w-1/4"
              title="Filtrer par fournisseur"
            >
              <Truck size={18} className="mr-2 text-gray-500" />
              <select
                value={fournisseurFiltre}
                onChange={(e) => setFournisseurFiltre(e.target.value)}
                className="outline-none w-full bg-transparent"
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre seuil */}
            <div
              className="flex items-center border rounded px-3 py-2 w-1/4"
              title="Filtrer par seuil (haut/bas)"
            >
              <AlertTriangle size={18} className="mr-2 text-gray-500" />
              <select
                value={seuilFiltre}
                onChange={(e) => setSeuilFiltre(e.target.value)}
                className="outline-none w-full bg-transparent"
              >
                <option value="">Tous les seuils</option>
                <option value="haut">Seuil le plus haut</option>
                <option value="bas">Seuil le plus bas</option>
              </select>
            </div>
          </div>
          {selectedIds.length > 0 && (
            <div className="mb-4 text-sm text-blue-700 bg-blue-100 p-3 rounded flex justify-between items-center">
              <span>{selectedIds.length} produit(s) sélectionné(s)</span>
              <div className="flex gap-2">
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={currentProduits.every((p) =>
                      selectedIds.includes(p.id)
                    )}
                    onChange={handleSelectAll}
                  />
                  Tout selectionner
                </th>
                <button
                  onClick={() => {
                    // Exemple d'action groupée
                    selectedIds.forEach((id) => handleDelete(id));
                    setSelectedIds([]);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Supprimer sélection
                </button>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => {
                      const p = produits.find((pr) => pr.id === id);
                      if (p) exportSinglePDF(p);
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Exporter PDF
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "description",
                    "prix_achat",
                    "prix_vente",
                    "quantite_en_stock",
                    "seuil_alerte",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 cursor-pointer text-sm"
                      onClick={() => toggleSort(col)}
                    >
                      {col.replace(/_/g, " ")}{" "}
                      {sortColumn === col ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  ))}

                  <th className="px-4 py-2 text-sm">Catégorie</th>
                  <th className="px-4 py-2 text-sm">Fournisseur</th>
                  <th className="px-4 py-2 text-sm text-center">Actions</th>
                  <th className="px-4 py-2 text-sm text-center"> </th>
                </tr>
              </thead>

              <tbody>
                {currentProduits.map((produit) => (
                  <tr
                    key={produit.id}
                    className={`border-b ${
                      produit.quantite_en_stock < produit.seuil_alerte
                        ? "bg-red-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    
                    <td className="px-4 py-2 text-center">{produit.nom}</td>
                    <td className="px-4 py-2 text-center">{produit.description}</td>
                    <td className="px-4 py-2 text-center">{produit.prix_achat} Ar</td>
                    <td className="px-4 py-2 text-center">{produit.prix_vente} Ar</td>
                    <td className="px-4 py-2 text-center">{produit.quantite_en_stock}</td>
                    <td className="px-4 py-2 text-center">{produit.seuil_alerte}</td>
                    <td className="px-4 py-2 text-center">
                      {getCategorieName(produit.categorie_id)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {getFournisseurName(produit.fournisseur_id)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button
                                onClick={() => {
                                  setSelectedProduit(produit);
                                  setEditModalOpen(true);
                                }}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                <Edit size={18} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              side="top"
                              className="bg-black text-white text-xs px-2 py-1 rounded shadow-md"
                            >
                              Modifier
                            </Tooltip.Content>
                          </Tooltip.Root>

                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button
                                onClick={() => handleDelete(produit.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              side="top"
                              className="bg-black text-white text-xs px-2 py-1 rounded shadow-md"
                            >
                              Supprimer
                            </Tooltip.Content>
                          </Tooltip.Root>

                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button
                                onClick={() => {
                                  setProduitDetail(produit);
                                  setDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Info size={18} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              side="top"
                              className="bg-black text-white text-xs px-2 py-1 rounded shadow-md"
                            >
                              Détails
                            </Tooltip.Content>
                          </Tooltip.Root>

                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button
                                onClick={() => exportSinglePDF(produit)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <FileDown size={18} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              side="top"
                              className="bg-black text-white text-xs px-2 py-1 rounded shadow-md"
                            >
                              Exporter en PDF
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      
                    </td>
                    <td className="">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(produit.id)}
                        onChange={() => handleCheckboxChange(produit.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">Page {currentPage}</p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Préc.
              </button>
              <button
                disabled={indexOfLast >= filteredProduits.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suiv.
              </button>
            </div>
          </div>

          {/* Modal d'édition */}
          <ProduitEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            produit={selectedProduit}
            onSuccess={handleEditSuccess}
            categories={categories}
            fournisseurs={fournisseurs}
          />
          <ProduitDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            produit={produitDetail}
          />
        </div>
        {alert && <AlertBottomLeft message={alert.message} type={alert.type} />}
      </div>
    </div>
  );
}

export default ProduitList;
