import React from 'react';

const TablaResultados = ({ datos }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Pieza</th>
            <th className="px-4 py-2">Proyecto Origen</th>
            <th className="px-4 py-2">Proyecto Destino</th>
            <th className="px-4 py-2">Cantidad</th>
            <th className="px-4 py-2">Tipo de Movimiento</th>
            <th className="px-4 py-2">Usuario</th>
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No se encontraron resultados.
              </td>
            </tr>
          ) : (
            datos.map((item, index) => (
              <tr key={index} className="text-sm text-gray-600 hover:bg-gray-50">
                <td className="border px-4 py-2">{new Date(item.fecha).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{item.nombre_pieza}</td>
                <td className="border px-4 py-2">{item.proyecto_anterior || 'N/A'}</td>
                <td className="border px-4 py-2">{item.proyecto_nuevo || 'N/A'}</td>
                <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                <td className="border px-4 py-2 capitalize">{item.tipo}</td>
                <td className="border px-4 py-2">{item.usuario}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaResultados;
