import React, { useState, useEffect } from "react";
import Sidebar from "../Layouts/Sidebar";
import { useNavigate } from "react-router-dom";
import VenteAddModal from "./VenteAddModal";
import axios from "axios";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AlertBottomLeft from "../../components/AlertBottomLeft";

function Vente() {
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVente, setSelectedVente] = useState(null);
  const [detailsProduits, setDetailsProduits] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Recherche & filtres
  const [searchClient, setSearchClient] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  //traige
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    const fetchVentes = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/ventes");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des ventes");
        const data = await response.json();
        setVentes(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/clients");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des clients");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVentes();
    fetchClients();
  }, []);

  const getClientNameById = (clientId) => {
    const client = clients.find((client) => client.id === clientId);
    return client ? client.nom.toLowerCase() : "Client inconnu";
  };

  const handleDetailsClick = async (venteId) => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/ventes/${venteId}/details`
      );
      if (!response.ok)
        throw new Error(
          "Erreur lors de la récupération des détails de la vente"
        );

      const details = await response.json();
      console.log("Détails reçus:", details); // Vérifie la structure ici

      // Si la structure des données est correcte
      setDetailsProduits(details);

      const venteDetails = ventes.find((vente) => vente.id === venteId);
      setSelectedVente(venteDetails);
    } catch (error) {
      setError(error.message);
    }
  };

  const closeDetails = () => {
    setSelectedVente(null);
    setDetailsProduits([]);
  };

  // Trier avant de filtrer
  const sortedVentes = [...ventes].sort((a, b) => {
    const aValue =
      sortColumn === "client" ? getClientNameById(a.client_id) : a[sortColumn];
    const bValue =
      sortColumn === "client" ? getClientNameById(b.client_id) : b[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Ensuite seulement : filtrer
  const filteredVentes = sortedVentes.filter((vente) => {
    const clientName = getClientNameById(vente.client_id);
    const matchSearch = clientName.includes(searchClient.toLowerCase());

    const venteDate = new Date(vente.date_vente).toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const matchDateDebut = dateDebut ? venteDate >= dateDebut : true;
    const matchDateFin = dateFin ? venteDate <= dateFin : true;

    return matchSearch && matchDateDebut && matchDateFin;
  });

  const totalPages = Math.ceil(filteredVentes.length / itemsPerPage);
  const paginatedVentes = filteredVentes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Résumés
  const totalRevenue = filteredVentes.reduce((acc, v) => acc + v.total, 0);
  const uniqueClients = new Set(filteredVentes.map((v) => v.client_id)).size;

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Client,Total"]
        .concat(
          filteredVentes.map((v) => {
            const date = new Date(v.date_vente).toLocaleDateString();
            const client = getClientNameById(v.client_id);
            return `${date},${client},${v.total}`;
          })
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ventes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const handleDelete = async (venteId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette vente ?")) {
      try {
        await axios.delete(
          `http://localhost:9000/api/ventes/delete/${venteId}`
        );
        setVentes((prev) => prev.filter((v) => v.id !== venteId));
        setMessage({
          type: "success",
          content: "Vente supprimée avec succès !",
        });
      } catch (error) {
        setMessage({
          type: "error",
          content: "Erreur lors de la suppression.",
        });
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 14;
    const startY = 20;
    let currentY = startY;

    doc.setFontSize(16);
    doc.text("🧾 Liste des Ventes", marginLeft, currentY);

    doc.setFontSize(12);
    currentY += 10;
    doc.text(
      "Date        | Client             | Total (Ar)",
      marginLeft,
      currentY
    );
    doc.text(
      "----------------------------------------------",
      marginLeft,
      currentY + 5
    );
    currentY += 12;

    filteredVentes.forEach((vente) => {
      const date = new Date(vente.date_vente).toLocaleDateString();
      const client = getClientNameById(vente.client_id);
      const total = vente.total.toString();

      const row = `${date} | ${client} | ${total}`;
      doc.text(row, marginLeft, currentY);
      currentY += 8;
    });

    doc.save("ventes_export.pdf");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <AlertBottomLeft
        type={message.type}
        message={message.content}
        onClose={() => setMessage({ type: "", content: "" })}
      />

      <div className="flex-1 bg-gray-50 p-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Liste des Ventes
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Résumé Statistique */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-300 p-4 rounded-2xl shadow text-center">
            <p className="text-sm text-gray-500">Total ventes</p>
            <p className="text-xl font-semibold">{filteredVentes.length}</p>
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-2xl shadow text-center">
            <p className="text-sm text-gray-500">Revenu total</p>
            <p className="text-xl font-semibold">{totalRevenue} Ar</p>
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-2xl shadow text-center">
            <p className="text-sm text-gray-500">Clients uniques</p>
            <p className="text-xl font-semibold">{uniqueClients}</p>
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-2xl shadow text-center">
            <p className="text-sm text-gray-500">Ventes aujourd'hui</p>
            <p className="text-xl font-semibold">
              {
                filteredVentes.filter((v) => {
                  const venteDate = new Date(v.date_vente)
                    .toISOString()
                    .split("T")[0];
                  const today = new Date().toISOString().split("T")[0];
                  return venteDate === today;
                }).length
              }
            </p>
          </div>
        </div>

        {/* Actions: Export + Ajouter vente */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-sm p-6 mb-6 flex flex-wrap justify-between items-end gap-6">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche client
              </label>
              <input
                type="text"
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                placeholder="Nom du client"
                className="px-3 py-2 border border-gray-300 rounded w-64"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded w-48"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded w-48"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Exporter PDF
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Exporter CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Effectuer une vente
            </button>
            <VenteAddModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onVenteAdded={() => console.log("Vente ajoutée !")}
            />
          </div>
        </div>

        {/* Table des ventes */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Historique des ventes
            </h3>
            <span className="text-sm text-gray-500">
              {filteredVentes.length} résultat
              {filteredVentes.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort("date_vente")}
                  >
                    Date{" "}
                    {sortColumn === "date_vente" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort("client_id")}
                  >
                    Client{" "}
                    {sortColumn === "client_id" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort("total")}
                  >
                    Total{" "}
                    {sortColumn === "total" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVentes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Aucun résultat trouvé. Essayez de modifier les filtres ou
                      d'ajouter une nouvelle vente.
                    </td>
                  </tr>
                ) : (
                  paginatedVentes.map((vente) => (
                    <tr key={vente.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(vente.date_vente).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {getClientNameById(vente.client_id)}
                      </td>
                      <td className="px-4 py-3">{vente.total} Ar</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleDetailsClick(vente.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleDelete(vente.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                          title="Supprimer"
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
        </div>

        {/* Pagination */}
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

        {/* Modal détails */}
        {selectedVente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 relative">
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-9 h-9 text-xl flex items-center justify-center hover:bg-red-700 transition"
                title="Fermer"
              >
                &times;
              </button>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                  🧾 Détails de la Vente
                </h3>

                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">📅 Date :</span>{" "}
                    {new Date(selectedVente.date_vente).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">👤 Client :</span>{" "}
                    {getClientNameById(selectedVente.client_id)}
                  </p>
                  <p>
                    <span className="font-medium">💰 Total :</span>{" "}
                    <span className="text-green-600 font-semibold">
                      {selectedVente.total} Ar
                    </span>
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
                  🧺 Produits
                </h4>
                {detailsProduits.length > 0 ? (
                  detailsProduits.map((produit, index) => (
                    <li
                      key={index}
                      className="text-gray-700 flex items-center gap-3"
                    >
                      {/* <img
                        src={produit.image} // Vérifie si produit.image existe aussi, sinon prévoir fallback
                        alt={produit.produit_nom} // mettre produit_nom ici aussi
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.png";
                        }}
                      /> */}
                      <div>
                        <span className="font-medium">
                          {produit.produit_nom}
                        </span>{" "}
                        — {produit.quantite} x {produit.prix_unitaire} Ar ={" "}
                        <span className="font-semibold">
                          {produit.total} Ar
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="italic text-gray-400">
                    Aucun produit trouvé.
                  </li>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Vente;
