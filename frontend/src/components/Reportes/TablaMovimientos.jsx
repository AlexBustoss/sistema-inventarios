import React, { useEffect, useState } from "react";
import axios from "axios";
import DetallesMovimientoModal from "./DetallesMovimientoModal";
import "../../styles/TablaMovimientos.css";

const TablaMovimientos = ({ filtros, pagina }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);

  const obtenerMovimientos = async () => {
    setLoading(true);
    try {
      const params = {
        ...filtros,
        page: pagina,
        limit: 10,
      };
      const { data } = await axios.get(
        "http://localhost:3000/api/reportes/movimientos",
        { params }
      );
      setMovimientos(data);
    } catch (err) {
      console.error("❌ Error al obtener movimientos:", err);
      setError("Error al obtener los movimientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerMovimientos();
  }, [filtros, pagina]);

  const abrirModal = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setMovimientoSeleccionado(null);
  };

  return (
    <div className="tabla-movimientos-container">
      <h3>📋 Movimientos de Inventario</h3>

      {loading && <p>Cargando movimientos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && movimientos.length === 0 && (
        <p>No se encontraron movimientos para los filtros aplicados.</p>
      )}

      {!loading && movimientos.length > 0 && (
        <table className="tabla-movimientos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pieza</th>
              <th>Proyecto Anterior</th>
              <th>Proyecto Nuevo</th>
              <th>Cantidad</th>
              <th>Tipo de Movimiento</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id_movimiento}>
                <td>{mov.id_movimiento}</td>
                <td>{mov.nombre_pieza}</td>
                <td>{mov.proyecto_anterior || "N/A"}</td>
                <td>{mov.proyecto_nuevo || "N/A"}</td>
                <td>{mov.cantidad}</td>
                <td>{mov.tipo}</td>
                <td>{new Date(mov.fecha).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => abrirModal(mov)}>Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAbierto && (
        <DetallesMovimientoModal
          movimiento={movimientoSeleccionado}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
};

export default TablaMovimientos;
