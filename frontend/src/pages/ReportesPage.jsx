import React, { useState } from "react";
import Header from "../components/Dashboard/Header"; // ✅ Agregamos el Header
import DashboardReportes from "../components/Reportes/DashboardReportes";
import FiltrosReportes from "../components/Reportes/FiltrosReportes";
import TablaMovimientos from "../components/Reportes/TablaMovimientos";
import PaginacionReportes from "../components/Reportes/PaginacionReportes";
import ExportarReportes from "../components/Reportes/ExportarReportes";
import "../styles/DashboardReportes.css"; // Importar estilos para el dashboard

const ReportesPage = () => {
  const [filtros, setFiltros] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    setPaginaActual(1); // Reinicia la paginación cuando se aplican nuevos filtros
  };

  return (
<div className="reportes-container main-content">
{/* ✅ Nuevo Header con botón de regreso al Dashboard */}
      <Header title="Reportes y Auditoría de Inventario" showBackButton={true} backPath="/dashboard" />

      {/* Dashboard con KPIs y Movimientos Recientes */}
      <DashboardReportes />

      {/* Filtros para Refinar Búsquedas */}
      <FiltrosReportes filtros={filtros} setFiltros={setFiltros} />

      {/* Tabla de Movimientos Filtrados */}
      <TablaMovimientos filtros={filtros} pagina={paginaActual} />

      {/* Paginación */}
      <PaginacionReportes
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
      />

      {/* Exportación de Reportes */}
      <ExportarReportes filtros={filtros} />
    </div>
  );
};

export default ReportesPage;
