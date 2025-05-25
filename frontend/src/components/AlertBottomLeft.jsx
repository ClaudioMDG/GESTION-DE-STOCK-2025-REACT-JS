import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const AlertBottomLeft = ({ message, type = "success", duration = 4000 }) => {
  const [visible, setVisible] = useState(false);
  const [alertKey, setAlertKey] = useState(0); // Ajouter un état pour le key unique

  useEffect(() => {
    if (!message) return;

    setAlertKey(prevKey => prevKey + 1); // Incrémenter le key à chaque nouveau message
    setVisible(true); // Réaffiche l'alerte à chaque changement de message

    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]); // message comme dépendance

  const getColor = () => {
    switch (type) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={alertKey} // Utilisation de key unique pour forcer la réaffichage
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
            aria-live="assertive"
            className={`text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-4 w-80 ${getColor()}`}
          >
            {getIcon()}
            <span className="flex-1">{message}</span>
            <button onClick={() => setVisible(false)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertBottomLeft;
