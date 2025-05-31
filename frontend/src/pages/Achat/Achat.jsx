// Achat.js
import React, { useState, useEffect } from "react";
import Sidebar from "../Layouts/Sidebar";
import AlertBottomLeft from "../../components/AlertBottomLeft";
import { useNavigate } from "react-router-dom";
import AchatAddModal from "./AchatAddModal";
import axios from "axios";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import autoTable from "jspdf-autotable";

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

  // Fetch achats et ajoute un timestamp local pour suivi
  const fetchAchats = async () => {
    try {
      const response = await fetch(`${URL}/api/achats`);
      if (!response.ok) throw new Error("Erreur lors du chargement des achats");
      const data = await response.json();

      const achatsAvecTimestamp = data.map((achat) => ({
        ...achat,
        // On peut utiliser date_achat comme référence, mais on ajoute un timestamp pour gestion locale si besoin
        _fetchedAt: Date.now(),
      }));

      setAchats(achatsAvecTimestamp);
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

  // Re-render toutes les minutes pour mise à jour du badge "Nouveau"
  useEffect(() => {
    const interval = setInterval(() => {
      setAchats((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getFournisseurNameById = (id) => {
    const f = fournisseurs.find((x) => x.id === id);
    return f ? f.nom.toLowerCase() : "Fournisseur inconnu";
  };

  const handleDetailsClick = async (achatId) => {
    try {
      const response = await fetch(`${URL}/api/achats/${achatId}/details`);
      if (!response.ok)
        throw new Error(
          "Erreur lors de la récupération des détails de l'achat"
        );
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

  // Trie par date décroissante (nouveaux en haut)
  const sortedAchats = [...achats].sort(
    (a, b) => new Date(b.date_achat) - new Date(a.date_achat)
  );

  // Filtrage
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
        await axios.delete(`${URL}/api/achats/delete/${achatId}`);
        setAchats((prev) => prev.filter((a) => a.id !== achatId));
        setAlertMessage("Suppression réussie !");
        setAlertType("success");
      } catch (error) {
        setAlertMessage("Suppression erreur !");
        setAlertType("error");
      }
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Liste des achats avec détails", 14, 20);

    for (const achat of filteredAchats) {
      const date = format(new Date(achat.date_achat), "dd/MM/yyyy");
      const fournisseur = getFournisseurNameById(achat.fournisseur_id);
      const total = achat.total.toLocaleString("fr-FR");

      // En-tête pour chaque achat
      doc.setFontSize(12);
      doc.text(
        `Date : ${date} | Fournisseur : ${fournisseur} | Total : ${total} Ar`,
        14,
        doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30
      );

      // Fetch détails produits
      try {
        const response = await fetch(`${URL}/api/achats/${achat.id}/details`);
        if (!response.ok) throw new Error("Erreur détails achat");

        const details = await response.json();

        const body = details.map((p) => [
          p.produit_nom, // nom du produit
          p.quantite,
          `${p.prix_unitaire} Ar`,
          `${p.total} Ar`,
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 35,
          head: [["Produit", "Quantité", "Prix unitaire", "Total"]],
          body,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: {
            fillColor: [33, 150, 243],
            textColor: [255, 255, 255],
          },
        });
      } catch (err) {
        console.error(`Erreur chargement détails pour achat ${achat.id}`, err);
      }
    }

    doc.save("achats_avec_details.pdf");
  };

  const handleExportAchatPDF = (achat) => {
    const doc = new jsPDF();
    const fournisseurName = getFournisseurNameById(achat.fournisseur_id);

    doc.setFontSize(14);
    doc.text("Détail de l'Achat", 14, 20);
    doc.setFontSize(11);
    doc.text(
      `Date : ${format(new Date(achat.date_achat), "dd/MM/yyyy")}`,
      14,
      30
    );
    doc.text(`Fournisseur : ${fournisseurName}`, 14, 37);
    doc.text(`Total : ${achat.total.toLocaleString("fr-FR")} Ar`, 14, 44);

    autoTable(doc, {
      startY: 55,
      head: [["Produit", "Quantité", "PU", "Total"]],
      body: (achat.details || []).map((p) => [
        p.produit_nom,
        p.quantite,
        p.prix_unitaire,
        p.total,
      ]),
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`achat_${achat.id}.pdf`);
  };

  // Fonction qui retourne true si achat fait dans les 10 dernières minutes
  const isNew = (dateAchat) => {
    const achatTimestamp = new Date(dateAchat).getTime();
    const now = Date.now();
    return now - achatTimestamp <= 10 * 60 * 1000; // 10 minutes en ms
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
                await fetchAchats(); // Recharge les achats
                setShowModal(false); // Ferme le modal
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
                    colSpan={4}
                    className="text-center py-8 text-gray-400 italic"
                  >
                    Aucun achat trouvé
                  </td>
                </tr>
              ) : (
                paginatedAchats.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2">
                      {new Date(a.date_achat).toLocaleDateString()}
                      {isNew(a.date_achat) && (
                        <span className="text-xs text-white bg-green-500 px-2 py-0.5 rounded-full animate-pulse">
                          🆕 Nouveau
                        </span>
                      )}
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
                        onClick={async () => {
                          const response = await fetch(
                            `${URL}/api/achats/${a.id}/details`
                          );
                          const details = await response.json();
                          const achatWithDetails = { ...a, details };
                          handleExportAchatPDF(achatWithDetails);
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        title="Exporter PDF"
                      >
                        PDF
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

        {selectedAchat && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-6 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto p-6">
              <h3 className="text-xl font-semibold mb-4">
                Détails de l'achat du{" "}
                {new Date(selectedAchat.date_achat).toLocaleDateString()}
              </h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Produit</th>
                    <th className="border px-2 py-1">Quantité</th>
                    <th className="border px-2 py-1">Prix</th>
                    <th className="border px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsProduits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Aucun détail trouvé
                      </td>
                    </tr>
                  ) : (
                    detailsProduits.map((prod) => (
                      <tr key={prod.id}>
                        <td className="border px-2 py-1">{prod.produit_nom}</td>
                        <td className="border px-2 py-1">{prod.quantite}</td>
                        <td className="border px-2 py-1">{prod.prix_unitaire} Ar</td>
                        <td className="border px-2 py-1">
                          {prod.total} Ar
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <button
                onClick={closeDetails}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Achat;
