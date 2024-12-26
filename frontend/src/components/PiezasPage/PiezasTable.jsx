import React, { useEffect, useState } from "react";
import { getAllPiezas, getLowStockPiezas } from "../../services/piezasService";
import "../../styles/InventoryTable.css";
import "../../styles/PiezasTable.css";


const PiezasTable = ({ piezas }) => {
  return (
    <div className="piezas-table-container">
      <table className="piezas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th>Ubicación</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {piezas.length > 0 ? (
            piezas.map((pieza) => (
              <tr key={pieza.ID_Pieza}>
                <td>{pieza.ID_Pieza}</td>
                <td>{pieza.Descripcion}</td>
                <td>{pieza.Marca}</td>
                <td>{pieza.Ubicacion}</td>
                <td>{pieza.Stock_Actual}</td>
                <td>{pieza.Stock_Minimo}</td>
                <td>{pieza.estado}</td>
                <td>
                  <button className="edit-button">Editar</button>
                  <button className="delete-button">Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PiezasTable;
