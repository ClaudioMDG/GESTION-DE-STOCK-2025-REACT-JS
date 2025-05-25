import React, { useState, useEffect } from "react";
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
import FournisseurAddModal from "./FournisseurAddModal";
import FournisseurEditModal from "./FournisseurEditModal";
import axios from "axios";

function FournisseurList() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("nom");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const fournisseursParPage = 10;
  const URL = import.meta.env.VITE_URL_API;
  const indexOfLast = currentPage * fournisseursParPage;
  const indexOfFirst = indexOfLast - fournisseursParPage;
  const currentFournisseurs = filteredFournisseurs.slice(
    indexOfFirst,
    indexOfLast
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filtrerEtTrier();
  }, [fournisseurs, search, sortColumn, sortAsc]);

  const fetchData = () => {
    axios.get(`${URL}/api/fournisseurs`).then((res) => {
      setFournisseurs(res.data);
    });
  };

  const filtrerEtTrier = () => {
    const filtrés = fournisseurs.filter((f) =>
      f.nom.toLowerCase().includes(search.toLowerCase())
    );

    const triés = [...filtrés].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
      return 0;
    });

    setFilteredFournisseurs(triés);
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
    axios.delete(`${URL}/api/fournisseurs/${id}`).then(() => {
      setFournisseurs(fournisseurs.filter((f) => f.id !== id));
      setAlert({
        message: "Fournisseur supprimé avec succès !",
        type: "success",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    });
  };

  // const handleAddSuccess = () => {
  //   setIsModalOpen(false);
  //   fetchData();
  //   setAlert({ message: "Fournisseur ajouté avec succès !", type: "success" });

  //   onClose();
  // };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchData();
    setAlert({
      message: "Fournisseur mis à jour avec succès !",
      type: "success",
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const exportCSV = () => {
    const lignes = [
      ["Nom", "Description", "Contact", "Email", "Adresse", "Téléphone"],
      ...fournisseurs.map((f) => [
        f.nom,
        f.description,
        f.contact,
        f.email,
        f.adresse,
        f.telephone,
      ]),
    ];
    const csv = lignes.map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fournisseurs.csv";
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    setAlert({
      message: `Import de ${file.name} (non implémenté)`,
      type: "info",
    });
  };

  const nbFournisseurs = fournisseurs.length;

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-50 p-4">
        <div className="w-full bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Liste des Fournisseurs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={exportCSV}
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

          <FournisseurAddModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onFournisseurAdded={() => {
              fetchData();
              setAlert({
                message: "Fournisseur ajouté avec succès !",
                type: "success",
              });
              setTimeout(() => setAlert(null), 3000);
            }}
            onAlert={setAlert}
          />
          {/* Modal d'édition */}
          <FournisseurEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            fournisseur={selectedFournisseur}
            onSuccess={() => {
              setEditModalOpen(false); // 🔴 Cette ligne est nécessaire
              fetchData();
              setAlert({
                message: "Fournisseur modifié avec succès !",
                type: "success",
              });
              setTimeout(() => setAlert(null), 3000);
            }}
          />
          {/* Statistiques */}
          <div className="mb-4 text-sm text-gray-600">
            Total : <strong>{nbFournisseurs}</strong> fournisseurs
          </div>

          {/* Recherche */}
          <input
            type="text"
            placeholder="🔍 Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
          />

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  {["nom", "contact", "email", "telephone"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 cursor-pointer text-sm"
                      onClick={() => toggleSort(col)}
                    >
                      {col.replace(/_/g, " ")}{" "}
                      {sortColumn === col ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFournisseurs.map((fournisseur) => (
                  <tr
                    key={fournisseur.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{fournisseur.nom}</td>
                    <td className="px-4 py-2">{fournisseur.contact}</td>
                    <td className="px-4 py-2">{fournisseur.email}</td>
                    <td className="px-4 py-2">{fournisseur.telephone}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFournisseur(fournisseur);
                            setEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(fournisseur.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => alert("Historique à implémenter")}
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
                disabled={indexOfLast >= filteredFournisseurs.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suiv.
              </button>
            </div>
          </div>
        </div>
        {alert && <AlertBottomLeft message={alert.message} type={alert.type} />}
      </div>
    </div>
  );
}

export default FournisseurList;
