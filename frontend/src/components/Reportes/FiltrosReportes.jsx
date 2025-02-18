import React, { useState, useEffect } from "react";
import "../../styles/FiltrosReportes.css"; // ✅ Agregamos los estilos de filtros

const FiltrosReportes = ({ filtros, setFiltros }) => {
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/proyectos");
        const data = await response.json();
        setProyectos(data);
      } catch (error) {
        console.error("❌ Error al obtener proyectos:", error);
      }
    };
    fetchProyectos();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <div className="filtros-container">
      <h3 className="filtros-titulo">Filtros Avanzados</h3>

      <div className="filtros-grid">
        {/* Proyecto */}
        <div className="filtro-item">
          <label>Proyecto:</label>
          <select name="idProyecto" value={filtros.idProyecto || ""} onChange={handleFiltroChange}>
            <option value="">Todos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Movimiento */}
        <div className="filtro-item">
          <label>Tipo de Movimiento:</label>
          <select name="tipo" value={filtros.tipo || ""} onChange={handleFiltroChange}>
            <option value="">Todos</option>
            <option value="asignación">Asignación</option>
            <option value="cambio">Cambio</option>
            <option value="liberación">Liberación</option>
            <option value="cancelación">Cancelación</option>
          </select>
        </div>

        {/* Usuario */}
        <div className="filtro-item">
          <label>Usuario:</label>
          <input type="text" name="usuario" value={filtros.usuario || ""} onChange={handleFiltroChange} />
        </div>

        {/* Fechas */}
        <div className="filtro-item">
          <label>Fecha Inicio:</label>
          <input type="date" name="fechaInicio" value={filtros.fechaInicio || ""} onChange={handleFiltroChange} />
        </div>
        <div className="filtro-item">
          <label>Fecha Fin:</label>
          <input type="date" name="fechaFin" value={filtros.fechaFin || ""} onChange={handleFiltroChange} />
        </div>
      </div>

      {/* Botones */}
      <div className="botones-container">
        <button className="boton-aplicar" onClick={() => setFiltros(filtros)}>Aplicar Filtros</button>
        <button className="boton-limpiar" onClick={() => setFiltros({})}>Limpiar</button>
      </div>
    </div>
  );
};

export default FiltrosReportes;
