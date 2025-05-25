import React, { useState } from 'react';
import Sidebar from '../Layouts/Sidebar';
import AchatAdd from './AchatAdd';
import AchatList from './AchatList';
import Header from '../Layouts/Header'; // Importer le Header

function Achat() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(prev => !prev); // Inverser pour déclencher un effet
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-4 ml-60">
        {/* Intégration du header */}
        <Header />

        <div className="flex flex-row gap-4 mt-6">
          <div className="flex-1">
            <AchatList refresh={refresh} />
          </div>
          <div className="w-2/4">
            <AchatAdd onAchatAdded={handleRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Achat;
