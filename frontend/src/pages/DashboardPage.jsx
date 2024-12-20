import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import MetricsCard from "../components/Dashboard/MetricsCard";
import InventoryTable from "../components/Dashboard/InventoryTable";
import LowStockItems from "../components/Dashboard/LowStockItems";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import "../styles/DashboardPage.css";
import { getAllPiezas, getLowStockPiezas } from "../services/piezasService"; // Importamos los servicios para consumir APIs
import { getProveedorCount } from "../services/proveedoresService";

const DashboardPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPiezas: 0,
    stockBajo: 0,
    proveedoresActivos: 0,
  });

  // Agrega y elimina la clase CSS de la página
  useEffect(() => {
    console.log("DashboardPage montado, agregando clase CSS a body");
    document.body.classList.add("dashboard");
    return () => {
      console.log("DashboardPage desmontado, eliminando clase CSS de body");
      document.body.classList.remove("dashboard");
    };
  }, []);

  // Obtener datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando fetchData para obtener datos del backend");

        // Obtener datos de todas las piezas
        const allPiezas = await getAllPiezas();
        console.log("Datos de todas las piezas obtenidos:", allPiezas);

        // Obtener datos de piezas con bajo stock
        const lowStockPiezas = await getLowStockPiezas();
        console.log("Datos de piezas con bajo stock obtenidos:", lowStockPiezas);

        // Obtener conteo de proveedores activos
        const proveedoresCount = await getProveedorCount();
        console.log("Proveedores Activos obtenidos:", proveedoresCount);

        // Actualizar estado con los datos obtenidos
        setInventoryData(allPiezas);
        setLowStockItems(lowStockPiezas);

        setMetrics({
          totalPiezas: allPiezas.length,
          stockBajo: lowStockPiezas.length,
          proveedoresActivos: proveedoresCount,
        });

        console.log("Estado metrics actualizado:", {
          totalPiezas: allPiezas.length,
          stockBajo: lowStockPiezas.length,
          proveedoresActivos: proveedoresCount,
        });
      } catch (error) {
        console.error("Error al cargar datos desde el backend:", error);
      }
    };

    fetchData(); // Ejecutamos la función para cargar los datos
  }, []);

  console.log("Renderizando DashboardPage con metrics:", metrics);

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-metrics">
        {/* Tarjetas con las métricas actualizadas */}
        <MetricsCard
          title="Total piezas"
          value={metrics.totalPiezas}
          color="blue"
          icon="box"
        />
        <MetricsCard
          title="Stock Bajo"
          value={metrics.stockBajo}
          color="red"
          icon="warning"
        />
        <MetricsCard
          title="Proveedores Activos"
          value={metrics.proveedoresActivos} // [MODIFICADO] Ahora es dinámico
          color="green"
          icon="users"
        />
      </div>
      <div className="dashboard-content-row">
        <div className="inventory-section">
          {/* Tabla de inventario */}
          <InventoryTable inventoryData={inventoryData} />
        </div>
        <div className="low-stock-section">
          {/* Sección de items con bajo stock */}
          <LowStockItems lowStockItems={lowStockItems} />
        </div>
      </div>
      <div className="navigation-buttons-container">
        {/* Botones de navegación */}
        <NavigationButtons />
      </div>
    </div>
  );
};

export default DashboardPage;
