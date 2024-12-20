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
      <div className="low-stock-wrapper">
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
              <tr key={item.ID_Pieza}>
                <td>{item.ID_Pieza}</td>
                <td>{item.Descripcion}</td>
                {/* Muestra solo el número sin contenedor adicional */}
                <td>{item.Stock_Actual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockItems;
