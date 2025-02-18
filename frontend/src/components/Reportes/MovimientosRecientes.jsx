import React, { useEffect, useState } from "react";

const MovimientosRecientes = () => {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/reportes/movimientos?limit=5");
        const data = await response.json();
        setMovimientos(data);
      } catch (error) {
        console.error("❌ Error al obtener movimientos recientes:", error);
      }
    };
    fetchMovimientos();
  }, []);

  return (
    <div className="tabla-movimientos">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Pieza</th>
            <th>Proyecto Anterior</th>
            <th>Proyecto Nuevo</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov, index) => (
            <tr key={index}>
              <td>{new Date(mov.fecha).toLocaleDateString()}</td>
              <td>{mov.nombre_pieza}</td>
              <td>{mov.proyecto_anterior || "N/A"}</td>
              <td>{mov.proyecto_nuevo || "N/A"}</td>
              <td>{mov.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovimientosRecientes;
