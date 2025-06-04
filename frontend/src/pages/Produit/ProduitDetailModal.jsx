import React from "react";
import { Dialog } from "@headlessui/react";

export default function ProduitInfoModal({
  isOpen,
  onClose,
  produit,
  getCategorieName,
  getFournisseurName,
}) {
  if (!produit) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-30">
        <Dialog.Panel className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">
            Détails du produitddd
          </Dialog.Title>

          <div className="space-y-2 text-sm text-gray-700">
            

            {/* 🆕 Champs supplémentaires */}
            <p>
              <strong>Code barre :</strong> {produit.code_barre}
            </p>
            <p>
              <strong>Date d’expiration :</strong> {produit.date_expiration}
            </p>
            <p>
              <strong>Emplacement stock :</strong> {produit.emplacement_stock}
            </p>
            <p>
              <strong>Poids :</strong> {produit.poids} {produit.unite_mesure}
            </p>
            <p>
              <strong>Unité de mesure :</strong> {produit.unite_mesure}
            </p>
            <p>
              <strong>Actif :</strong> {produit.est_actif ? "Oui" : "Non"}
            </p>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
