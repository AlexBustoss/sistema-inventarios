import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardButton.css"; // Archivo de estilos para el botón

const DashboardButton = () => {
  const navigate = useNavigate(); // Hook para navegación

  return (
    <button
      className="dashboard-button"
      onClick={() => navigate("/dashboard")} // Ajusta la ruta según tu configuración
    >
      ⬅ Volver al Dashboard
    </button>
  );
};

export default DashboardButton;
