import React, { useState, useEffect } from "react";
import AchatAddModal from "./AchatAddModal"; // Assurez-vous que le chemin est correct
import axios from "axios";
import Sidebar from "../Layouts/Sidebar";

function AchatList({ refresh }) {
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [detailsProduits, setDetailsProduits] = useState([]);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date_achat");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const achatsPerPage = 5;
  // Nombre total d'achats
  const totalAchats = achats.length;

  // Somme des totaux d'achats
  const totalMontantAchats = achats.reduce(
    (acc, achat) => acc + achat.total,
    0
  );

  // Nombre d'achats aujourd'hui
  const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD
  const achatsAujourdHui = achats.filter((a) =>
    a.date_achat.startsWith(today)
  ).length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achatRes, fournisseurRes] = await Promise.all([
          axios.get("http://localhost:9000/api/achats"),
          axios.get("http://localhost:9000/api/fournisseurs"),
        ]);

        setAchats(Array.isArray(achatRes.data) ? achatRes.data : []);
        setFournisseurs(
          Array.isArray(fournisseurRes.data) ? fournisseurRes.data : []
        );
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      }
    };

    fetchData();
  }, [refresh]);

  const getFournisseurNom = (id) => {
    const fournisseur = fournisseurs.find((f) => f.id === id);
    return fournisseur ? fournisseur.nom : "Inconnu";
  };

  const handleDetailsClick = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/achats/${id}/details`
      );
      setSelectedAchat(achats.find((a) => a.id === id));
      setDetailsProduits(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des détails :", err);
    }
  };

  const closeDetails = () => {
    setSelectedAchat(null);
    setDetailsProduits([]);
  };

  const deleteAchat = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet achat ?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:9000/api/achats/${id}`);
      alert("Achat supprimé avec succès");
      refresh(); // recharge les données
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Une erreur est survenue lors de la suppression de l'achat");
    }
  };

  const filteredAchats = achats
    .filter((a) =>
      getFournisseurNom(a.fournisseur_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aField = a[sortField];
      const bField = b[sortField];
      if (sortOrder === "asc") return aField > bField ? 1 : -1;
      return aField < bField ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredAchats.length / achatsPerPage);
  const displayedAchats = filteredAchats.slice(
    (currentPage - 1) * achatsPerPage,
    currentPage * achatsPerPage
  );

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-gray-900">
            {totalAchats}
          </span>
          <span className="mt-2 text-gray-600 text-center">
            Nombre total d'achats
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-gray-900">
            {totalMontantAchats.toLocaleString()} Ar
          </span>
          <span className="mt-2 text-gray-600 text-center">
            Montant total des achats
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-gray-900">
            {achatsAujourdHui}
          </span>
          <span className="mt-2 text-gray-600 text-center">
            Achats aujourd'hui
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Rechercher par fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-1/3"
        />
        <div className="flex gap-2">
          <select
            className="border px-2 py-1 rounded"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="date_achat">Date</option>
            <option value="total">Total</option>
          </select>
          <select
            className="border px-2 py-1 rounded"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Ajouter un Achat
        </button>

        <input
          type="text"
          placeholder="Rechercher par fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <AchatAddModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onAchatAdded={() => {
                setShowModal(false);
                refresh();
              }}
            />
          </div>
        </div>
      )}

      <table className="w-full mb-6 table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Fournisseur</th>
            <th className="text-left p-2">Total</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedAchats.length > 0 ? (
            displayedAchats.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-2">
                  {new Date(a.date_achat).toLocaleDateString()}
                </td>
                <td className="p-2">{getFournisseurNom(a.fournisseur_id)}</td>
                <td className="p-2">{a.total} Ar</td>
                <td className="p-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleDetailsClick(a.id)}
                  >
                    Détails
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 ml-2"
                    onClick={() => deleteAchat(a.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                Aucun achat trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      )}

      {selectedAchat && (
        <div className="mt-4">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            onClick={closeDetails}
          >
            Fermer
          </button>
          <h3 className="text-xl font-semibold mt-4">Détails de l'achat</h3>
          <ul>
            {detailsProduits.map((p) => (
              <li key={p.id}>
                {p.produit_nom} - {p.quantite} x {p.prix} Ar
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AchatList;
