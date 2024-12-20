import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import MetricsCard from "../components/Dashboard/MetricsCard";
import InventoryTable from "../components/Dashboard/InventoryTable";
import LowStockItems from "../components/Dashboard/LowStockItems";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import "../styles/DashboardPage.css";
import { getAllPiezas, getLowStockPiezas } from "../services/piezasService"; // Importamos los servicios para consumir APIs

const DashboardPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPiezas: 0,
    stockBajo: 0,
    proveedoresActivos: 0,
  });

  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => {
      document.body.classList.remove("dashboard");
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todas las piezas y las piezas con bajo stock
        const allPiezas = await getAllPiezas();
        const lowStockPiezas = await getLowStockPiezas();

        // Actualizar datos de las tablas
        setInventoryData(allPiezas);
        setLowStockItems(lowStockPiezas);

        // Actualizar métricas
        setMetrics({
          totalPiezas: allPiezas.length,
          stockBajo: lowStockPiezas.length,
          proveedoresActivos: 8, // Este valor puede obtenerse del backend si es necesario
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-metrics">
        <MetricsCard title="Total piezas" value={metrics.totalPiezas} color="blue" icon="box" />
        <MetricsCard title="Stock Bajo" value={metrics.stockBajo} color="red" icon="warning" />
        <MetricsCard title="Proveedores Activos" value={metrics.proveedoresActivos} color="green" icon="users" />
      </div>
      <div className="dashboard-content-row">
        <div className="inventory-section">
          <InventoryTable inventoryData={inventoryData} />
        </div>
        <div className="low-stock-section">
          <LowStockItems lowStockItems={lowStockItems} />
        </div>
      </div>
      <div className="navigation-buttons-container">
        <NavigationButtons />
      </div>
    </div>
  );
};

export default DashboardPage;
