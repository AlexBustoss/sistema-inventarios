import React from "react";
import "../../styles/LowStockItems.css";

const LowStockItems = ({ lowStockItems = [] }) => {
  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <div className="low-stock-container">
        <h2>Piezas con Bajo Stock</h2>
        <p>No hay piezas con bajo stock.</p>
      </div>
    );
  }

  return (
    <div className="low-stock-container">
      <h2>Piezas con Bajo Stock</h2>
      <div className="low-stock-wrapper"> {/* Contenedor para el scroll */}
        <table className="low-stock-table">
          <thead>
            <tr>
              <th>ID Pieza</th>
              <th>Nombre</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td className="low-quantity">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockItems;
