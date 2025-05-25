import React, { useEffect, useState } from 'react';
import Sidebar from './Layouts/Sidebar';

function Home() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:9000/api/stats')
      .then(res => {
        if (!res.ok) throw new Error('Erreur de chargement des statistiques');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, []);
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log("Utilisateur connecté avec un token :", token);
  } else {
    console.log("Aucun token trouvé, utilisateur non connecté.");
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col p-6 ml-60">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Tableau de bord</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {!stats ? (
          <p className="text-gray-600">Chargement des statistiques...</p>
        ) : (
          <>
            {/* Cartes statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <StatCard label="Clients" value={stats.totalClients} />
              <StatCard label="Produits" value={stats.totalProduits} />
              <StatCard label="Ventes" value={stats.totalVentes} />
              <StatCard label="Achats" value={stats.totalAchats} />
              <StatCard label="Total Ventes (Ar)" value={stats.totalVenteValue.toFixed(2)} />
              <StatCard label="Total Achats (Ar)" value={stats.totalAchatValue.toFixed(2)} />
            </div>

            {/* Produits faibles en stock */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-yellow-700">🛑 Produits faibles en stock</h2>
              <ul className="bg-yellow-50 p-4 rounded-lg shadow-inner">
                {stats.produitsFaibles.length > 0 ? (
                  stats.produitsFaibles.map(p => (
                    <li key={p.nom} className="flex justify-between border-b py-2 text-yellow-800">
                      {p.nom} – Stock: {p.quantite_en_stock} / Seuil: {p.seuil_alerte}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">Tous les stocks sont au-dessus du seuil.</li>
                )}
              </ul>
            </div>

            {/* Top produits vendus */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-green-700">🏆 Top 5 produits vendus</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                {stats.topProduits.map(p => (
                  <li key={p.nom}>{p.nom} – {p.total_vendu} unités</li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-blue-100 text-blue-900 p-4 rounded-lg shadow text-center">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default Home;
