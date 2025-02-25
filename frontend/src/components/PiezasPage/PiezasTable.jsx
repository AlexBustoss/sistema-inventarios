import React, { useState, useEffect } from "react";
import "../../styles/PiezasTable.css";
import "../../styles/SearchBar.css";
import "../../styles/Notification.css";
import ConfirmDialog from "../../components/ConfirmDialog";

/**
 * Este componente muestra y edita las piezas del catálogo.
 * Ajustado para NO usar Ubicacion, Stock_Actual, Stock_Minimo.
 */
const PiezasTable = ({ piezas, setPiezas }) => {
  const [filters, setFilters] = useState({ keyword: "" });
  const [sortedPiezas, setSortedPiezas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Ordenar las piezas por Descripcion al cargar el componente
  useEffect(() => {
    // Asegúrate de que `piezas.Descripcion` sea un string
    const sorted = [...piezas].sort((a, b) =>
      (a.Descripcion || "").localeCompare(b.Descripcion || "", "es", { sensitivity: "base" })
    );
    setSortedPiezas(sorted);
  }, [piezas]);

  // Función para capitalizar la primera letra de cada palabra
  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Función para eliminar acentos
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Manejo de cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Filtrado dinámico con normalización
  const filteredPiezas = sortedPiezas.filter((pieza) => {
    const keywordNormalized = normalizeText(filters.keyword);
    // Filtramos solo por Descripcion y Marca (quitamos Ubicacion)
    return (
      normalizeText(pieza.Descripcion || "").includes(keywordNormalized) ||
      normalizeText(pieza.Marca || "").includes(keywordNormalized)
    );
  });

  // Confirmar eliminación
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  // Eliminar pieza
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/piezas/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPiezas((prevPiezas) => prevPiezas.filter((pieza) => pieza.ID_Pieza !== deleteId));
        setNotification({ message: "Pieza eliminada exitosamente", type: "success" });
      } else {
        setNotification({ message: "Error al eliminar la pieza", type: "error" });
      }
    } catch (error) {
      console.error("Error eliminando la pieza:", error);
      setNotification({ message: "Error eliminando la pieza", type: "error" });
    }
    setShowConfirmDialog(false);
    setDeleteId(null);

    setTimeout(() => setNotification(null), 3000);
  };

  // Función para manejar la edición
  const handleEdit = (pieza) => {
    setIsEditing(true);
    setEditingData({ ...pieza });
  };

  // Guardar los cambios realizados en la edición
  const handleSaveEdit = async () => {
    // Validamos solo Descripcion, Marca, estado (quitar Ubicacion, Stock_Actual, Stock_Minimo)
    if (!editingData.Descripcion || !editingData.Marca || !editingData.estado) {
      setNotification({ message: "Por favor, completa Descripcion, Marca y estado", type: "warning" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/piezas/${editingData.ID_Pieza}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingData),
      });

      if (response.ok) {
        const updatedPieza = await response.json();
        setPiezas((prevPiezas) =>
          prevPiezas.map((pieza) => (pieza.ID_Pieza === editingData.ID_Pieza ? updatedPieza : pieza))
        );
        setIsEditing(false);
        setEditingData(null);
        setNotification({ message: "Pieza actualizada exitosamente", type: "success" });
      } else {
        setNotification({ message: "Error al actualizar la pieza. Revisa los datos enviados.", type: "error" });
      }
    } catch (error) {
      console.error("Error actualizando la pieza:", error);
      setNotification({
        message: "Error actualizando la pieza. Verifica la conexión o los datos.",
        type: "error"
      });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  // Manejo de cambios en los campos de edición
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditingData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="piezas-table-container">
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Buscador */}
      <div className="search-bar-container">
        <input
          type="text"
          name="keyword"
          placeholder="Buscar por palabra clave..."
          value={filters.keyword}
          onChange={handleFilterChange}
          className="search-bar-input"
        />
      </div>

      {/* Tabla de piezas (ya sin Ubicacion, Stock_Actual, Stock_Minimo) */}
      <table className="piezas-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Descripción</th>
          <th>Marca</th>
          <th>Stock Libre</th>
          <th>Acciones</th>
        </tr>
      </thead>

        <tbody>
          {filteredPiezas.length > 0 ? (
            filteredPiezas.map((pieza) => {
              const isRowBeingEdited = isEditing && editingData?.ID_Pieza === pieza.ID_Pieza;
              
              return (
                <tr key={pieza.ID_Pieza}>
                  {isRowBeingEdited ? (
                    <>
                      <td>{pieza.ID_Pieza}</td>
                      <td>
                        <input
                          type="text"
                          name="Descripcion"
                          value={editingData.Descripcion || ""}
                          onChange={handleChangeEdit}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="Marca"
                          value={editingData.Marca || ""}
                          onChange={handleChangeEdit}
                        />
                      </td>
                      <td>{pieza.stockLibre ?? "n/a"}</td>

                      <td>
                        <button className="save-button" onClick={handleSaveEdit}>Guardar</button>
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditingData(null);
                          }}
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{pieza.ID_Pieza || "N/A"}</td>
                      <td>{capitalizeFirstLetter(pieza.Descripcion || "N/A")}</td>
                      <td>{capitalizeFirstLetter(pieza.Marca || "N/A")}</td>
                      <td>{pieza.stockLibre ?? "n/a"}</td>

                      <td>
                        <button className="edit-button" onClick={() => handleEdit(pieza)}>Editar</button>
                        <button className="delete-button" onClick={() => confirmDelete(pieza.ID_Pieza)}>Eliminar</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* Confirmación de eliminación */}
      {showConfirmDialog && (
        <ConfirmDialog
          message="¿Estás seguro de que deseas eliminar esta pieza?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};

export default PiezasTable;
