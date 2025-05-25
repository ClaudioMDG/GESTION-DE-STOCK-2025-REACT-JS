import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import ClientList from "./pages/Client/ClientList";


import FournisseurList from "./pages/Fournisseurs/FournisseurList";



import CategorieList from "./pages/Categorie/CategorieList";
// import CategorieUpdate from "./pages/Categorie/CategorieUpdate";

import ProduitList from "./pages/Produit/ProduitList";

import UserList from "./pages/User/UserList";

import Login from "./pages/Login";
import Vente from "./pages/Vente/Vente";
import VenteDetail from "./pages/Vente/VenteDetail";

import Achat from "./pages/Achat/Achat";

import { ProtectedRoute } from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />

        <Route path="/ClientList" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
       

        <Route path="/FournisseurAdd" element={<ProtectedRoute><FournisseurAdd /></ProtectedRoute>} />
        <Route path="/FournisseurList" element={<ProtectedRoute><FournisseurList /></ProtectedRoute>} />
        <Route path="/FournisseurUpdate/:id" element={<ProtectedRoute><FournisseurUpdate /></ProtectedRoute>} />

        <Route path="/CategorieAdd" element={<ProtectedRoute><CategorieAdd /></ProtectedRoute>} />
        <Route path="/CategorieList" element={<ProtectedRoute><CategorieList /></ProtectedRoute>} />
        {/* <Route path="/CategorieUpdate/:id" element={<CategorieUpdate />} /> */}

        <Route path="/ProduitAdd" element={<ProtectedRoute><ProduitAdd /></ProtectedRoute>} />
        <Route path="/ProduitList" element={<ProtectedRoute><ProduitList /></ProtectedRoute>} />
        <Route path="/ProduitUpdate/:id" element={<ProtectedRoute><ProduitUpdate /></ProtectedRoute>} />

        <Route path="/UserAdd" element={<ProtectedRoute><UserAdd /></ProtectedRoute>} />
        <Route path="/UserList" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/UserUpdate/:id" element={<ProtectedRoute><UserUpdate /></ProtectedRoute>} />

        <Route path="/venteAdd" element={<ProtectedRoute><VenteAdd /></ProtectedRoute>} />
        <Route path="/venteList" element={<ProtectedRoute><VenteList /></ProtectedRoute>} />
        <Route path="/venteDetail" element={<ProtectedRoute><VenteDetail /></ProtectedRoute>} />
        <Route path="/vente" element={<ProtectedRoute><Vente /></ProtectedRoute>} />

        <Route path="/AchatAdd" element={<ProtectedRoute><AchatAdd /></ProtectedRoute>} />
        <Route path="/AchatList" element={<ProtectedRoute><AchatList /></ProtectedRoute>} />
        <Route path="/Achat" element={<ProtectedRoute><Achat /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
