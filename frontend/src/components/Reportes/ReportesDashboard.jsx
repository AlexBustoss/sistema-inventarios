import React, { useState, useEffect } from 'react';
//import FiltrosReportes from './FiltrosReportes';
import TablaResultados from './TablaResultados';

const ReportesDashboard = () => {
  const [filtros, setFiltros] = useState({});
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const obtenerDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...filtros, page: paginaActual, limit: 10 });
      const response = await fetch(`http://localhost:3000/api/reportes/movimientos?${params.toString()}`);
      const data = await response.json();

      setResultados(data);
      setTotalPaginas(Math.ceil(data.length / 10)); // Ajustar si el backend devuelve el total
    } catch (err) {
      setError('Error al obtener los datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [filtros, paginaActual]);

  const manejarCambioFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    setPaginaActual(1);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">📊 Reportes de Movimientos de Stock</h1>
      <FiltrosReportes onChange={manejarCambioFiltros} />

      {cargando && <p className="text-center text-blue-500">Cargando datos...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!cargando && !error && <TablaResultados resultados={resultados} />}

      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2">Página {paginaActual} de {totalPaginas}</span>
        <button
          onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ReportesDashboard;
