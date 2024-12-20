import React, { useEffect } from "react";
import Header from "../components/Dashboard/Header";
import MetricsCard from "../components/Dashboard/MetricsCard";
import InventoryTable from "../components/Dashboard/InventoryTable";
import LowStockItems from "../components/Dashboard/LowStockItems";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import "../styles/DashboardPage.css";

const mockInventoryData = [
  { id: "001", fecha: "2024-12-03", estado: "Pendiente", usuario: "Juan Pérez" },
  { id: "002", fecha: "2024-12-01", estado: "Procesada", usuario: "Ana López" },
  { id: "003", fecha: "2024-11-25", estado: "Pendiente", usuario: "Carlos García" },
  { id: "004", fecha: "2024-11-20", estado: "Procesada", usuario: "María Torres" },
  { id: "005", fecha: "2024-11-18", estado: "Pendiente", usuario: "Luis Martínez" },
  { id: "006", fecha: "2024-11-15", estado: "Procesada", usuario: "Sofía López" },
  
];


const lowStockItemsData = [
  { id: "A123", name: "Tornillo 8mm", quantity: 5 },
  { id: "B456", name: "Placa de acero", quantity: 2 },
  { id: "C789", name: "Motor eléctrico", quantity: 1 },
  { id: "D101", name: "Engranaje 15T", quantity: 4 },
  { id: "E202", name: "Cinta adhesiva", quantity: 3 },
  { id: "F303", name: "Rodamiento 6204", quantity: 2 },
  { id: "A123", name: "Tornillo 8mm", quantity: 5 },
  { id: "B456", name: "Placa de acero", quantity: 2 },
  { id: "C789", name: "Motor eléctrico", quantity: 1 },
  { id: "D101", name: "Engranaje 15T", quantity: 4 },
  { id: "E202", name: "Cinta adhesiva", quantity: 3 },
  { id: "F303", name: "Rodamiento 6204", quantity: 2 }
];

const DashboardPage = () => {
  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => {
      document.body.classList.remove("dashboard");
    };
  }, []);

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-metrics">
        <MetricsCard title="Total piezas" value="250" color="blue" icon="box" />
        <MetricsCard title="Stock Bajo" value="10 Piezas" color="red" icon="warning" />
        <MetricsCard title="Proveedores Activos" value="8" color="green" icon="users" />
      </div>
      <div className="dashboard-content-row">
      <div className="inventory-section">
        <InventoryTable inventoryData={mockInventoryData} />
      </div>
        <div className="low-stock-section">
          <LowStockItems lowStockItems={lowStockItemsData} />
        </div>
      </div>

      <div className="navigation-buttons-container">
        <NavigationButtons />
      </div>
    </div>
  );
};

export default DashboardPage;
