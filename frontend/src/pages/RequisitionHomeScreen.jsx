import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RequisitionHomeScreen.css";

const GestionRequisiciones = () => {
  const navigate = useNavigate();

  const [requisiciones, setRequisiciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Cargar las requisiciones al montar
  useEffect(() => {
    fetchRequisiciones();
  }, []);

  // Llamada al backend
  const fetchRequisiciones = async () => {
    try {
      const response = await axios.get("/api/requisiciones");
      setRequisiciones(response.data);
    } catch (error) {
      console.error("Error al obtener requisiciones:", error);
    }
  };

  // Editar
  const handleEditar = (idRequisicion) => {
    navigate(`/editar-requisicion/${idRequisicion}`);
  };

  // Eliminar
  const handleEliminar = async (idRequisicion) => {
    try {
      await axios.delete(`/api/requisiciones/${idRequisicion}`);
      fetchRequisiciones(); // Recargar la lista tras eliminar
    } catch (error) {
      console.error("Error al eliminar requisición:", error);
    }
  };

  // Filtrado en tiempo real
  const requisicionesFiltradas = requisiciones.filter((req) => {
    const texto = busqueda.toLowerCase();

    // Convertir a string y minúsculas
    const idStr = req.ID_Requisicion
      ? req.ID_Requisicion.toString().toLowerCase()
      : "";
    const solicitante = (req.Nombre_Solicitante || "").toLowerCase();

    // Ver si busqueda aparece en ID o en nombre solicitante
    return idStr.includes(texto) || solicitante.includes(texto);
  });

  return (
    <div className="requisition-container">
      <button
        className="dashboard-back-button"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Regresar al Dashboard
      </button>

      <header className="requisition-header">
        <img
          src="/assets/images/CODETEC.png"
          alt="Codetec Logo"
          className="requisition-logo"
        />
        <h1 className="requisition-title">Gestión de Requisiciones</h1>
        <div className="user-avatar" title="Perfil de Usuario">
          <span className="user-initial">A</span>
        </div>
      </header>

      <section className="requisition-search-section">
        <h2 className="requisition-section-title">Buscar Requisiciones</h2>
        <input
          type="text"
          className="requisition-search-bar"
          placeholder="Escribe para buscar requisiciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      <section className="requisition-table-section">
        <h2 className="requisition-section-title">Listado de Requisiciones</h2>
        <div className="table-container">
          <table className="requisition-table">
            <thead>
              <tr>
                <th>ID Requisición</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Solicitante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requisicionesFiltradas.map((req) => (
                <tr key={req.ID_Requisicion} className="requisition-row">
                  <td className="requisition-id">{req.ID_Requisicion}</td>
                  <td className="requisition-date">{req.Fecha || "—"}</td>
                  <td
                    className={`requisition-status ${
                      req.estado === "Pendiente" ? "status-pending" : "status-processed"
                    }`}
                  >
                    {req.estado}
                  </td>
                  <td className="requisition-user">
                    {req.Nombre_Solicitante || "—"}
                  </td>
                  <td className="requisition-actions">
                    <button
                      className="requisition-edit-button"
                      onClick={() => handleEditar(req.ID_Requisicion)}
                    >
                      Editar
                    </button>
                    <button
                      className="requisition-delete-button"
                      onClick={() => handleEliminar(req.ID_Requisicion)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {requisicionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                    No hay requisiciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="requisition-add-section">
        <button
          className="requisition-add-button"
          title="Agregar una nueva requisición"
          onClick={() => navigate("/gestion-requisiciones")}
        >
          Agregar Nueva Requisición
        </button>
      </section>
    </div>
  );
};

export default GestionRequisiciones;
