import React, { useState }  from 'react';
import VenteAdd from './VenteAdd';
import VenteList from './VenteList';
import Sidebar from '../Layouts/Sidebar';


function Vente() {
  const [refresh, setRefresh] = useState(false);
  
  const handleRefresh = () => {
    setRefresh(prev => !prev); // Inverser pour déclencher un effet
  };
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col p-4 ml-60"> {/* Ajout de ml-64 pour compenser la largeur de la sidebar */}
        <div className="flex flex-row gap-4">  {/* Utilisation de gap pour espacer les colonnes */}
          {/* Liste des ventes */}
          <div className="flex-1"> {/* Permet de remplir l'espace restante */}
            <VenteList refresh={refresh} />
          </div>
          {/* Formulaire d'ajout de vente */}
          <div className="w-2/4"> {/* Ajuster la largeur selon vos besoins */}
            <VenteAdd onVenteAdded={handleRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vente;