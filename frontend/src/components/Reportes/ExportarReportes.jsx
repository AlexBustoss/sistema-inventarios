import React from "react";
import { Download } from "lucide-react"; // Icono para el botón
import "../../styles/ExportarReportes.css"; // ✅ Importamos los estilos

const ExportarReportes = ({ filtros }) => {
  const handleExport = () => {
    console.log("Exportando datos con filtros:", filtros);
    // Aquí iría la lógica para generar el CSV o PDF
  };

  return (
    <div className="exportar-container">
      <button className="boton-exportar" onClick={handleExport}>
        <Download className="icono-exportar" /> Exportar a CSV
      </button>
    </div>
  );
};

export default ExportarReportes;
