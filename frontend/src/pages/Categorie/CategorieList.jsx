import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  FileDown,
  FileUp,
  Clock3,
} from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import AlertBottomLeft from "../../components/AlertBottomLeft";
import axios from "axios";
import CategorieModalAdd from "./CategorieModalAdd"; // ✅ Import du modal
import CategorieEditModal from "./CategorieEditModal";

function CategorieList() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("nom");
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ État du modal

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [categories, search, sortColumn, sortAsc]);

  const fetchCategories = () => {
    axios.get("http://localhost:9000/api/categories").then((res) => {
      setCategories(res.data);
    });
  };

  const filterAndSort = () => {
    const filtered = categories.filter((c) =>
      c.nom.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
      return 0;
    });

    setFilteredCategories(sorted);
  };

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Nom", "Description"],
      ...categories.map((c) => [c.nom, c.description || ""]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories.csv";
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    setAlert({
      message: `Import de ${file.name} (non implémenté)`,
      type: "info",
    });
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce client ?")) return;
    try {
      await axios.delete(`http://localhost:9000/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setAlert({
        message: "Categories supprimé avec succès !",
        type: "success",
      });

      // Réinitialiser l'alerte après 3 secondes
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (error) {
      setAlert({
        message: "Erreur lors de la suppression du Categories.",
        type: "error",
      });

      // Réinitialiser l'alerte après 3 secondes
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-50 p-4">
        <div className="w-full bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Liste des Catégories
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchCategories}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={exportCSV}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                <FileDown size={16} />
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
                onClick={() => setIsModalOpen(true)} // ✅ Ouvre le modal
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Ajouter
              </button>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Total : <strong>{categories.length}</strong> catégories
          </div>

          <input
            type="text"
            placeholder="🔍 Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
          />

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th
                    className="px-4 py-2 cursor-pointer text-sm"
                    onClick={() => toggleSort("nom")}
                  >
                    Nom {sortColumn === "nom" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th className="px-4 py-2 text-sm">Description</th>
                  <th className="px-4 py-2 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{cat.nom}</td>
                    <td className="px-4 py-2">{cat.description || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategorie(cat);
                            setEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setAlert({
                              message: "Historique client à venir.",
                              type: "info",
                            })
                          }
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Clock3 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                disabled={indexOfLast >= filteredCategories.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suiv.
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Modal intégré ici */}
        <CategorieModalAdd
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchCategories();
            setAlert({
              message: "Categorie ajouté avec succès !",
              type: "success",
            });
            setTimeout(() => setAlert(null), 3000);
          }}
        />
        
        <CategorieEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          categorie={selectedCategorie}
          onSuccess={() => {
            fetchCategories();
            setAlert({
              message: "Catégorie modifiée avec succès !",
              type: "success",
            });
            setTimeout(() => setAlert(null), 3000);
          }}
        />
      </div>
      {alert && <AlertBottomLeft message={alert.message} type={alert.type} />}
    </div>
  );
}

export default CategorieList;
