import React from "react";
import { Dialog } from "@headlessui/react";

export default function ProduitInfoModal({
  isOpen,
  onClose,
  produit,
  getCategorieName,
  getFournisseurName,
}) {
  const URL = import.meta.env.VITE_URL_API;
  if (!produit) return null;
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-30">
        <Dialog.Panel className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold mb-6 text-center text-gray-800">
            Détails du produit
          </Dialog.Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image du produit */}
            <div className="flex justify-center items-center">
              {produit.image_path  ? (
                <img
                  src={`${URL}${produit.image_path}`}
                  alt="Produit"
                  className="w-full max-w-xs h-auto object-contain rounded-lg border"
                />
              ) : (
                <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                  Pas d’image
                </div>
              )}
            </div>

            {/* Détails texte */}
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Nom :</strong> {produit.nom}
              </p>
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
                <strong>Actif :</strong> {produit.est_actif ? "Oui" : "Non"}
              </p>
            </div>
          </div>

          <div className="mt-8 text-right">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
