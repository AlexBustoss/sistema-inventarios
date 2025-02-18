import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import MetricsCard from "../components/Dashboard/MetricsCard";
import InventoryTable from "../components/Dashboard/InventoryTable";
import LowStockItems from "../components/Dashboard/LowStockItems";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import { useNavigate } from "react-router-dom"; // Importamos el hook para la navegación
import "../styles/DashboardPage.css";
import { getAllPiezas, getLowStockPiezas } from "../services/piezasService"; // Importamos los servicios para consumir APIs
import { getProveedorCount } from "../services/proveedoresService";
import { FiSettings, FiPackage, FiFileText, FiBarChart2 } from "react-icons/fi"; // Íconos de react-icons

const DashboardPage = () => {
  const navigate = useNavigate(); // Hook para navegación

  const [inventoryData, setInventoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPiezas: 0,
    stockBajo: 0,
    proveedoresActivos: 0,
  });

  const dashboardButtons = [
    {
      id: 1,
      text: "Gestión de Piezas",
      icon: <FiSettings />,
      onClick: () => navigate("/gestion-piezas"),
    },
    {
      id: 2,
      text: "Gestión de Proveedores",
      icon: <FiPackage />,
      onClick: () => navigate("/gestion-proveedores"),
    },
    {
      id: 3,
      text: "Gestión de Requisiciones",
      icon: <FiFileText />,
      onClick: () => navigate("/home-requisiciones"),
    },
    {
      id: 4,
      text: "Reportes",
      icon: <FiBarChart2 />,
      onClick: () => navigate("/reportes"),
    },
  ];

  // Agrega y elimina la clase CSS de la página
  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => {
      document.body.classList.remove("dashboard");
    };
  }, []);

  // Obtener datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allPiezas = await getAllPiezas();
        const lowStockPiezas = await getLowStockPiezas();
        const proveedoresCount = await getProveedorCount();

        setInventoryData(allPiezas);
        setLowStockItems(lowStockPiezas);
        setMetrics({
          totalPiezas: allPiezas.length,
          stockBajo: lowStockPiezas.length,
          proveedoresActivos: proveedoresCount,
        });
      } catch (error) {
        console.error("Error al cargar datos desde el backend:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-page main-content">
      {/* Header con título dinámico */}
      <Header title="Dashboard" />
      <div className="dashboard-metrics">
        {/* Tarjetas con métricas */}
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
          value={metrics.proveedoresActivos}
          color="green"
          icon="users"
        />
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
        {/* Pasamos los botones dinámicamente */}
        <NavigationButtons buttons={dashboardButtons} />
      </div>
    </div>
  );
};

export default DashboardPage;
