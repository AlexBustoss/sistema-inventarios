import React, { useEffect, useState } from "react";
import TarjetaResumen from "./TarjetaResumen";
import MovimientosRecientes from "./MovimientosRecientes";

const DashboardReportes = () => {
  const [resumen, setResumen] = useState({
    totalInventario: 0,
    porcentajeConsumido: 0,
    ordenesActivas: 0,
    topProyectos: [],
  });

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/reportes/resumen");
        const data = await response.json();
    
        // Transformamos los nombres de las claves para que coincidan con el estado
        const resumenTransformado = {
          totalInventario: parseInt(data.totalinventario, 10) || 0,
          porcentajeConsumido: parseFloat(data.porcentajeconsumido).toFixed(2) || "0.00",
          ordenesActivas: parseInt(data.totalordenes, 10) || 0,
        };
    
        setResumen(resumenTransformado);
      } catch (error) {
        console.error("❌ Error al obtener el resumen:", error.message, await response.text());
      }
    };
    
    fetchResumen();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Tarjetas de Resumen */}
      <div className="resumen-grid">
        <TarjetaResumen
          titulo="Total Inventario"
          valor={resumen.totalInventario}
          icono="📦"
        />
        <TarjetaResumen
          titulo="% Stock Consumido"
          valor={`${resumen.porcentajeConsumido}%`}
          icono="🔥"
        />
        <TarjetaResumen
          titulo="Órdenes Activas"
          valor={resumen.ordenesActivas}
          icono="🛒"
        />
      </div>

      {/* Movimientos Recientes */}
      <h3>📌 Movimientos Recientes</h3>
      <MovimientosRecientes />
    </div>
  );
};

export default DashboardReportes;
