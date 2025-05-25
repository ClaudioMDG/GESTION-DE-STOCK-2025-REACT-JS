import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";
import Sidebar from "../Layouts/Sidebar";
import { Link } from "react-router-dom";
import ClientAddModal from "./ClientAddModal";
import AlertBottomLeft from "../../components/AlertBottomLeft";
import ClientEditModal from "./ClientEditModal";
import { CSVLink } from "react-csv"; // Ajout uniquement pour l'export CSV

function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const clientsPerPage = 10;

  // Fonction pour ouvrir le modal d'édition d'un client
  const openEditModal = (id) => {
    setSelectedClientId(id);
    setIsEditModalOpen(true);
  };

  // Fonction pour mettre à jour un client
  const handleClientUpdated = (updatedClient) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    setAlert({ message: "Client mis à jour avec succès", type: "success" });
  };

  // Fonction pour ajouter un client
  const handleClientAdded = (newClient) => {
    setClients([...clients, newClient]);
    setAlert({ message: "Client ajouté avec succès", type: "success" });
  };

  // Chargement des clients depuis l'API
  useEffect(() => {
    axios
      .get("http://localhost:9000/api/clients")
      .then((response) => {
        setClients(response.data);
        setFilteredClients(response.data); // initial list is same as the full list
      })
      .catch(() =>
        setAlert({ message: "Erreur de chargement des clients", type: "error" })
      );
  }, []);

  // Filtrage des clients par recherche
  useEffect(() => {
    if (searchQuery) {
      setFilteredClients(
        clients.filter(
          (client) =>
            client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.telephone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.adresse.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  // Fonction pour supprimer un client
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:9000/api/clients/${id}`)
      .then(() => {
        setClients((prev) => prev.filter((client) => client.id !== id));
        setAlert({ message: "Client supprimé avec succès", type: "success" });
      })
      .catch(() =>
        setAlert({ message: "Erreur : client non supprimé", type: "error" })
      );
  };

  // Pagination
  const indexOfLastClient = page * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  const paginate = (pageNumber) => setPage(pageNumber);

  // Export des données en CSV
  const headers = [
    { label: "Nom", key: "nom" },
    { label: "Email", key: "email" },
    { label: "Téléphone", key: "telephone" },
    { label: "Adresse", key: "adresse" },
  ];

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 bg-gray-50 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">Liste des Clients</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter Client
            </button>
            <ClientAddModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onClientAdded={handleClientAdded}
            />
            <CSVLink
              data={clients}
              headers={headers}
              filename="clients.csv"
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Exporter CSV
            </CSVLink>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Téléphone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Adresse</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{client.nom}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{client.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{client.telephone}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{client.adresse}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openEditModal(client.id)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Edit size={20} />
                      </button>
                      <ClientEditModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        clientId={selectedClientId}
                        onClientUpdated={handleClientUpdated}
                      />
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => paginate(page - 1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            disabled={page === 1}
          >
            Précédent
          </button>
          <span className="self-center text-sm text-gray-600">
            Page {page} sur {Math.ceil(filteredClients.length / clientsPerPage)}
          </span>
          <button
            onClick={() => paginate(page + 1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            disabled={page === Math.ceil(filteredClients.length / clientsPerPage)}
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Alerte */}
      <AlertBottomLeft message={alert.message} type={alert.type} />
    </div>
  );
}

export default ClientList;
