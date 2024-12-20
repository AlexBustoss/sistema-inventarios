import React from "react";
import "../../styles/InventoryTable.css";
import { FaClock, FaCheckCircle } from "react-icons/fa"; // Importa íconos específicos

const InventoryTable = ({ inventoryData }) => (
  <div className="inventory-table-container">
    <h2>Resumen del Inventario</h2>
    <div className="inventory-table-wrapper"> {/* Contenedor para habilitar scroll */}
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
          {inventoryData.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.fecha}</td>
              <td>
                <span
                  className={`status-icon ${
                    item.estado === "Pendiente"
                      ? "status-pending"
                      : "status-processed"
                  }`}
                >
                  {item.estado === "Pendiente" ? (
                    <FaClock className="status-icon-svg" />
                  ) : (
                    <FaCheckCircle className="status-icon-svg" />
                  )}
                  {` ${item.estado}`}
                </span>
              </td>
              <td>{item.usuario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InventoryTable;
