import React, { useState } from 'react';
import { Home, Box, FileText, Users, LogOut, ChevronDown, ChevronUp, UserPlus, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logout from '../../components/Logout';

function Sidebar() {
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isVentesOpen, setIsVentesOpen] = useState(false);
  const [isAchatsOpen, setIsAchatsOpen] = useState(false);
  const [isFournisseurOpen, setIsFournisseurOpen] = useState(false);
  const [isCategorieOpen, setIsCategorieOpen] = useState(false);
  const [isProduitOpen, setIsProduitOpen] = useState(false);

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-md border-r hidden md:flex flex-col ">
      <div className="p-6 text-2xl font-bold text-blue-600 border-b">
        MyDashboard
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Produits */}
        <div>
          <button 
            onClick={() => setIsProduitOpen(!isProduitOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5" />
              <span>Produits</span>
            </div>
            {isProduitOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isProduitOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/ProduitList" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Produits</span>
              </Link>
              
            </div>
            
          )}
        </div>

        

        {/* Clients */}
        <div>
          <button 
            onClick={() => setIsClientsOpen(!isClientsOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
             <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Clients</span>
            </div>
            {isClientsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isClientsOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/clientList" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Clients</span>
              </Link>
            
            </div>
          )}
        </div>
        <div>
          <button 
            onClick={() => setIsVentesOpen(!isVentesOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Vente</span>
            </div>
            {isVentesOpen? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isVentesOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/vente" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Vente</span>
              </Link>
          
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={() => setIsAchatsOpen(!isAchatsOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Achat</span>
            </div>
            {isAchatsOpen? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isAchatsOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/achat" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Achat</span>
              </Link>
             
            </div>
          )}
        </div>


        {/* Fournisseurs */}
        <div>
          <button 
            onClick={() => setIsFournisseurOpen(!isFournisseurOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Fournisseurs</span>
            </div>
            {isFournisseurOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isFournisseurOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/FournisseurList" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Fournisseur</span>
              </Link>
            </div>
          )}
        </div>

        {/* Catégories */}
        <div>
          <button 
            onClick={() => setIsCategorieOpen(!isCategorieOpen)}
            className="flex items-center justify-between px-4 py-2 w-full text-gray-700 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5" />
              <span>Catégories</span>
            </div>
            {isCategorieOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isCategorieOpen && (
            <div className="pl-6 space-y-2">
              <Link to="/CategorieList" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
                <span>Liste Catégories</span>
              </Link>
            </div>
          )}
        </div>

        {/* Ajouter utilisateur */}
        <Link to="/UserList" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 text-gray-700">
          <UserPlus className="w-5 h-5" />
          <span>Liste user</span>
        </Link>
      </nav>
      {/* Logout */}
      <Logout />
    </aside>
  );
}

export default Sidebar;
