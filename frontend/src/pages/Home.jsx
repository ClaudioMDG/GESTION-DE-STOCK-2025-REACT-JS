import React, { useEffect, useState } from "react";
import Sidebar from "./Layouts/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const periods = ["day", "week", "month", "quarter"];

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const URL = import.meta.env.VITE_URL_API;
  // Filtres
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Charger catégories pour filtre
    fetch(`${URL}/api/categories`)
      .then((res) => res.json())
      .then((json) => setCategories(json.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [period, startDate, endDate, selectedCategory]);

  function fetchDashboardData() {
    let url = `${URL}/api/dashboard?period=${period}&startDate=${startDate}&endDate=${endDate}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;

    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error("Erreur lors du chargement du tableau de bord");
        return res.json();
      })
      .then((json) => {
        if (json.success) setData(json.data);
        else throw new Error("Erreur dans les données");
      })
      .catch((err) => setError(err.message));
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 ml-60">
          <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
          <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 ml-60">
          <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Préparer les données pour graphiques

  // 1. Evolution ventes/achats (line chart)
  const evolutionLabels = Array.from(
    new Set([
      ...data.evolution.ventes.map((e) => e.periode),
      ...data.evolution.achats.map((e) => e.periode),
    ])
  ).sort();

  const ventesEvolutionData = evolutionLabels.map((label) => {
    const item = data.evolution.ventes.find((e) => e.periode === label);
    return item ? item.total_ventes : 0;
  });

  const achatsEvolutionData = evolutionLabels.map((label) => {
    const item = data.evolution.achats.find((e) => e.periode === label);
    return item ? item.total_achats : 0;
  });

  // 2. Ventes et achats par catégorie (bar chart)
  const categoriesLabels = Array.from(
    new Set([
      ...data.byCategory.ventes.map((c) => c.categorie),
      ...data.byCategory.achats.map((c) => c.categorie),
    ])
  );

  const ventesByCategoryData = categoriesLabels.map((cat) => {
    const c = data.byCategory.ventes.find((v) => v.categorie === cat);
    return c ? c.total_ventes : 0;
  });
  const achatsByCategoryData = categoriesLabels.map((cat) => {
    const c = data.byCategory.achats.find((v) => v.categorie === cat);
    return c ? c.total_achats : 0;
  });

  // 3. Top produits vendus / achetés (bar chart)
  const topVentesLabels = data.topProduits.ventes.map((p) => p.nom);
  const topVentesQuantite = data.topProduits.ventes.map(
    (p) => p.quantite_vendue
  );
  const topAchatsLabels = data.topProduits.achats.map((p) => p.nom);
  const topAchatsQuantite = data.topProduits.achats.map(
    (p) => p.quantite_achetee
  );

  // 4. Marges par produit (bar chart)
  const margesLabels = data.margesProduit.map((p) => p.nom);
  const margesData = data.margesProduit.map((p) => p.marge);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 ml-60 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

        {/* FILTRES */}
        <section className="mb-6 flex flex-wrap gap-4 items-center ">
          <label>
            Période :{" "}
            <select
              className="border rounded px-2 py-1"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date début :{" "}
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <label>
            Date fin :{" "}
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          {/* <label>
            Catégorie :{" "}
            <select
              className="border rounded px-2 py-1"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">Toutes</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </label> */}
        </section>

        {/* Grille 2 colonnes pour graphiques */}
        <section className="mb-10 grid md:grid-cols-2 gap-6 ">
          {/* 1. Evolution des ventes et achats */}
          <div className="bg-white p-4 rounded-lg -md h-[250px] flex flex-col border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Évolution des ventes et achats ({period})
            </h2>
            <div className="flex-1">
              <Line
                data={{
                  labels: evolutionLabels,
                  datasets: [
                    {
                      label: "Ventes",
                      data: ventesEvolutionData,
                      borderColor: "rgba(34,197,94,1)",
                      backgroundColor: "rgba(34,197,94,0.4)",
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: "Achats",
                      data: achatsEvolutionData,
                      borderColor: "rgba(59,130,246,1)",
                      backgroundColor: "rgba(59,130,246,0.4)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: { mode: "index", intersect: false },
                  },
                  interaction: { mode: "nearest", axis: "x", intersect: false },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          {/* 2. Ventes et achats par catégorie */}
          <div className="bg-white p-4 rounded-lg -md h-[250px] flex flex-col border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Ventes et achats par catégorie
            </h2>
            <div className="flex-1">
              <Bar
                data={{
                  labels: categoriesLabels,
                  datasets: [
                    {
                      label: "Ventes",
                      data: ventesByCategoryData,
                      backgroundColor: "rgba(34,197,94,0.7)",
                    },
                    {
                      label: "Achats",
                      data: achatsByCategoryData,
                      backgroundColor: "rgba(59,130,246,0.7)",
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* 3. Top produits vendus */}
          <div className="bg-white p-4 rounded-lg -md h-[250px] flex flex-col border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Top produits vendus</h2>
            <div className="flex-1">
              <Bar
                data={{
                  labels: topVentesLabels,
                  datasets: [
                    {
                      label: "Quantité vendue",
                      data: topVentesQuantite,
                      backgroundColor: "rgba(34,197,94,0.8)",
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* 4. Top produits achetés */}
          <div className="bg-white p-4 rounded-lg -md h-[250px] flex flex-col border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Top produits achetés</h2>
            <div className="flex-1">
              <Bar
                data={{
                  labels: topAchatsLabels,
                  datasets: [
                    {
                      label: "Quantité achetée",
                      data: topAchatsQuantite,
                      backgroundColor: "rgba(59,130,246,0.8)",
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* 5. Marges bénéficiaires par produit */}
          <div className="bg-white p-4 rounded-lg -md h-[250px] flex flex-col border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Marges bénéficiaires par produit
            </h2>
            <div className="flex-1">
              <Bar
                data={{
                  labels: margesLabels,
                  datasets: [
                    {
                      label: "Marge",
                      data: margesData,
                      backgroundColor: "rgba(251,191,36,0.8)", // jaune
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </section>

        {/* 6. Comportement client (simple tableau) */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Comportement d'achat des clients
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Client</th>
                <th className="border border-gray-300 p-2 text-right">
                  Fréquence d'achat
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Panier moyen
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Récurrence
                </th>
              </tr>
            </thead>
            <tbody>
              {!data.comportementClients ||
              data.comportementClients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-600">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                data.comportementClients.map((c) => (
                  <tr key={c.client_id}>
                    <td className="border border-gray-300 p-2">{c.nom_client}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {c.frequence_achat}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {c.panier_moyen.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {c.recurrence}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
