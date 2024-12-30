import React, { useState } from "react";
import "../styles/PiezasAgregadasTable.css";

const PiezasAgregadasTable = ({ piezas, setPiezas }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // Manejo de edición
  const handleEdit = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    setEditingData(piezas[index]); // Copiar los datos de la pieza a editar
  };

  // Guardar cambios realizados en la edición
  const handleSaveEdit = () => {
    const updatedPiezas = [...piezas];
    updatedPiezas[editingIndex] = editingData; // Actualizar el dato editado en el array
    setPiezas(updatedPiezas);
    setIsEditing(false);
    setEditingIndex(null);
    setEditingData(null);
  };

  // Manejo de eliminación
  const handleDelete = (index) => {
    const updatedPiezas = piezas.filter((_, i) => i !== index);
    setPiezas(updatedPiezas);
  };

  // Manejo de cambios en los inputs de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="piezas-agregadas-table-container">
      <table className="piezas-agregadas-table">
        <thead>
            <tr>
            <th>No. Parte</th>
            <th>Cantidad</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th>Fecha Registro</th>
            <th>No. Proyecto</th>
            <th>Proveedor</th> {/* Nueva columna */}
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {piezas.length > 0 ? (
            piezas.map((pieza, index) => (
                <tr key={index}>
                <td>{pieza.noParte}</td>
                <td>{pieza.cantidad}</td>
                <td>{pieza.descripcion}</td>
                <td>{pieza.marca}</td>
                <td>{pieza.fechaRegistro}</td>
                <td>{pieza.noProyecto || "N/A"}</td>
                <td>{pieza.proveedor || "N/A"}</td> 
                <td>
                    <button
                    className="delete-button"
                    onClick={() => handleDelete(index)}
                    >
                    Eliminar
                    </button>
                </td>
                </tr>
            ))
            ) : (
            <tr>
                <td colSpan="7" className="no-data">
                No hay datos disponibles
                </td>
            </tr>
            )}
        </tbody>
        </table>

    </div>
  );
};

export default PiezasAgregadasTable;
