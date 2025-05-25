// Achat.js
import React, { useState, useEffect } from "react";
import Sidebar from "../Layouts/Sidebar";
import AlertBottomLeft from "../../components/AlertBottomLeft";
import { useNavigate } from "react-router-dom";
import AchatAddModal from "./AchatAddModal";
import axios from "axios";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";

function Achat() {
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [detailsProduits, setDetailsProduits] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [searchFournisseur, setSearchFournisseur] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const URL = import.meta.env.VITE_URL_API;
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success | error | info | warning
  
  const fetchAchats = async () => {
    try {
      const response = await fetch(`${URL}/api/achats`);
      if (!response.ok) throw new Error("Erreur lors du chargement des achats");
      setAchats(await response.json());
    } catch (error) {
      setError(error.message);
    }
  };
  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const response = await fetch(`${URL}/api/fournisseurs`);
        if (!response.ok)
          throw new Error("Erreur lors du chargement des fournisseurs");
        setFournisseurs(await response.json());
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAchats();
    fetchFournisseurs();
  }, []);

  const getFournisseurNameById = (id) => {
    const f = fournisseurs.find((x) => x.id === id);
    return f ? f.nom.toLowerCase() : "Fournisseur inconnu";
  };

  const handleDetailsClick = async (achatId) => {
    try {
      const response = await fetch(
        `${URL}/api/achats/${achatId}/details`
      );
      if (!response.ok)
        throw new Error(
          "Erreur lors de la récupération des détails de l'achat"
        );
      // const details = await response.json();
      // console.log("Détails reçus:", details);

      setDetailsProduits(await response.json());
      setSelectedAchat(achats.find((a) => a.id === achatId));
    } catch (error) {
      setError(error.message);
    }
  };

  const closeDetails = () => {
    setSelectedAchat(null);
    setDetailsProduits([]);
  };

  const sortedAchats = [...achats].sort((a, b) => {
    const aVal =
      sortColumn === "fournisseur"
        ? getFournisseurNameById(a.fournisseur_id)
        : a[sortColumn];
    const bVal =
      sortColumn === "fournisseur"
        ? getFournisseurNameById(b.fournisseur_id)
        : b[sortColumn];
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredAchats = sortedAchats.filter((a) => {
    const nomFournisseur = getFournisseurNameById(a.fournisseur_id);
    const matchSearch = nomFournisseur.includes(
      searchFournisseur.toLowerCase()
    );
    const achatDate = new Date(a.date_achat).toISOString().split("T")[0];
    return (
      matchSearch &&
      (!dateDebut || achatDate >= dateDebut) &&
      (!dateFin || achatDate <= dateFin)
    );
  });

  const totalPages = Math.ceil(filteredAchats.length / itemsPerPage);
  const paginatedAchats = filteredAchats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalMontant = filteredAchats.reduce((acc, a) => acc + a.total, 0);
  const uniqueFournisseurs = new Set(
    filteredAchats.map((a) => a.fournisseur_id)
  ).size;

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (achatId) => {
    if (window.confirm("Supprimer cet achat ?")) {
      try {
        await axios.delete(
          `${URL}/api/achats/delete/${achatId}`
        );
        setAchats((prev) => prev.filter((a) => a.id !== achatId));
        setAlertMessage("Suppression réussie !");
        setAlertType("success");
      } catch (error) {
        setAlertMessage("Suppression erreur !");
        setAlertType("error");
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("🧾 Liste des Achats", 14, 20);
    let y = 30;
    filteredAchats.forEach((a) => {
      const date = new Date(a.date_achat).toLocaleDateString();
      const fournisseur = getFournisseurNameById(a.fournisseur_id);
      doc.text(`${date} | ${fournisseur} | ${a.total} Ar`, 14, y);
      y += 10;
    });
    doc.save("achats_export.pdf");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <AlertBottomLeft message={alertMessage} type={alertType} />
      <div className="flex-1 bg-gray-50 p-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Liste des Achats
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Total achats</p>
            <p className="text-xl font-semibold">{filteredAchats.length}</p>
          </div>
          <div className="bg-white border p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-xl font-semibold">{totalMontant} Ar</p>
          </div>
          <div className="bg-white border p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Fournisseurs uniques</p>
            <p className="text-xl font-semibold">{uniqueFournisseurs}</p>
          </div>
          <div className="bg-white border p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Achats aujourd'hui</p>
            <p className="text-xl font-semibold">
              {
                filteredAchats.filter(
                  (a) =>
                    new Date(a.date_achat).toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0]
                ).length
              }
            </p>
          </div>
        </div>

        <div className="bg-white border p-6 rounded-xl shadow mb-6 flex flex-wrap justify-between items-end gap-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Recherche fournisseur</label>
              <input
                value={searchFournisseur}
                onChange={(e) => setSearchFournisseur(e.target.value)}
                className="px-3 py-2 border rounded w-64"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Date début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="px-3 py-2 border rounded w-48"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="px-3 py-2 border rounded w-48"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Exporter PDF
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ajouter achat
            </button>
            <AchatAddModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onAchatAdded={async () => {
                await fetchAchats(); // ✅ Recharge les achats
                setShowModal(false); // ✅ Ferme le modal
                setAlertMessage("Achat ajouté avec succès !");
                setAlertType("success");
              }}
            />
          </div>
        </div>

        <div className="bg-white border p-6 rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("date_achat")}
                >
                  Date{" "}
                  {sortColumn === "date_achat" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("fournisseur_id")}
                >
                  Fournisseur{" "}
                  {sortColumn === "fournisseur_id" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  Total{" "}
                  {sortColumn === "total" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAchats.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Aucun achat trouvé
                  </td>
                </tr>
              ) : (
                paginatedAchats.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(a.date_achat).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {getFournisseurNameById(a.fournisseur_id)}
                    </td>
                    <td className="px-4 py-3">{a.total} Ar</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleDetailsClick(a.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {selectedAchat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 relative">
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-9 h-9 text-xl flex items-center justify-center hover:bg-red-700"
              >
                &times;
              </button>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                  🧾 Détails de l'Achat
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>📅 Date :</strong>{" "}
                    {new Date(selectedAchat.date_achat).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>🏢 Fournisseur :</strong>{" "}
                    {getFournisseurNameById(selectedAchat.fournisseur_id)}
                  </p>
                  <p>
                    <strong>💰 Total :</strong>{" "}
                    <span className="text-green-600 font-semibold">
                      {selectedAchat.total} Ar
                    </span>
                  </p>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
                  📦 Produits
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700">
                  {detailsProduits.length > 0 ? (
                    detailsProduits.map((produit, index) => (
                      <li key={index}>
                        <strong>{produit.produit_nom}</strong> —{" "}
                        {produit.quantite} x {produit.prix_unitaire} Ar ={" "}
                        <strong>{produit.total} Ar</strong>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-400">
                      Aucun produit trouvé.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Achat;
