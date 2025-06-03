import React, { useState, useEffect } from "react";
import axios from "axios";
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
import ClientAddModal from "./ClientAddModal";
import ClientEditModal from "./ClientEditModal";
import Header from "../Layouts/Header";

function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("nom");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsParPage = 10;
  const URL = import.meta.env.VITE_URL_API;
  const indexOfLast = currentPage * clientsParPage;
  const indexOfFirst = indexOfLast - clientsParPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filtrerEtTrier();
  }, [clients, search, sortColumn, sortAsc]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${URL}/api/clients`);
      setClients(res.data);
    } catch (err) {
      setAlert({
        message: "Erreur lors du chargement des clients",
        type: "error",
      });
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // const fecthAlert = async () => {
  //   setAlert({ message: "Client ajouter avec succès !", type: "success" });

  //   // Réinitialiser l'alerte après 3 secondes
  //   setTimeout(() => {
  //     setAlert(null);
  //   }, 3000);
  // };
  // useEffect(() => {
  //   fecthAlert();
  // }, []);

  const filtrerEtTrier = () => {
    const filtrés = clients.filter((c) =>
      c.nom?.toLowerCase().includes(search.toLowerCase())
    );

    const triés = [...filtrés].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
      return 0;
    });

    setFilteredClients(triés);
  };

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce client ?")) return;
    try {
      await axios.delete(`${URL}/api/clients/${id}`);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setAlert({ message: "Client supprimé avec succès !", type: "success" });

      // Réinitialiser l'alerte après 3 secondes
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (error) {
      setAlert({
        message: "Erreur lors de la suppression du client.",
        type: "error",
      });

      // Réinitialiser l'alerte après 3 secondes
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    fetchData();
    setCurrentPage(1);
    setAlert({ message: "Client ajouté avec succès !", type: "success" });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchData();
    setAlert({ message: "Client mis à jour avec succès !", type: "success" });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const exportCSV = () => {
    const lignes = [
      ["Nom", "Email", "Téléphone", "Adresse"],
      ...clients.map((c) => [c.nom, c.email, c.telephone, c.adresse]),
    ];
    const csv = lignes.map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlert({
        message: `Import de ${file.name} (fonctionnalité à venir)`,
        type: "info",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex flex-1">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-50 p-4">
        <div className="w-full bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Liste des Clients
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
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Ajouter
              </button>
            </div>
          </div>

          <ClientAddModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onClientAdded={fetchData}
            handleAddSuccess={handleAddSuccess}
          />

          <ClientEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            client={selectedClient}
            onSuccess={handleEditSuccess}
          />

          <input
            type="text"
            placeholder="🔍 Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
          />

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  {["nom", "email", "telephone", "adresse"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 cursor-pointer text-sm"
                      onClick={() => toggleSort(col)}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}{" "}
                      {sortColumn === col ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{client.nom}</td>
                    <td className="px-4 py-2">{client.email}</td>
                    <td className="px-4 py-2">{client.telephone}</td>
                    <td className="px-4 py-2">{client.adresse}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
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
                disabled={indexOfLast >= filteredClients.length}
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
        </div>
  );
}

export default ClientList;
