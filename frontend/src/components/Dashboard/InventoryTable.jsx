import React, { useState, useEffect } from "react";
import "../../styles/InventoryTable.css";
import { FaClock, FaCheckCircle } from "react-icons/fa";

const InventoryTable = () => {
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requisiciones");
        if (!response.ok) {
          throw new Error("Error al obtener el inventario");
        }
        const data = await response.json();
        setInventoryData(data);
      } catch (error) {
        console.error("Error al obtener datos de inventario:", error);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="inventory-table-container">
      <h2>Ultimas requisiciones</h2>
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID Requisición</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.ID_Requisicion}>
                <td>{item.ID_Requisicion}</td>
                <td>
                  {new Date(item.Fecha).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td>
                  <span
                    className={`status-text ${
                      item.estado === "Pendiente"
                        ? "text-pending"
                        : item.estado === "Activa"
                        ? "text-active"
                        : item.estado === "Aceptada"
                        ? "text-accepted"
                        : item.estado === "Cancelada"
                        ? "text-canceled"
                        : "text-other"
                    }`}
                  >
                    {item.estado}
                  </span>
                </td>

                <td>{item.Nombre_Solicitante || "No asignado"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
