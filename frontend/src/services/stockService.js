import axios from "axios";

const STOCK_API_URL = "http://localhost:3000/api/stock"; // Ruta base para la API de stock

// Registrar nuevo stock para una pieza
export const registrarStock = async (stock) => {
  try {
    const response = await axios.post(`${STOCK_API_URL}`, stock);
    return response.data; // Retorna los datos del stock registrado
  } catch (error) {
    console.error("Error al registrar el stock:", error);
    throw error;
  }
};

// Actualizar stock existente para una pieza
export const actualizarStock = async (idStock, stock) => {
  try {
    const response = await axios.put(`${STOCK_API_URL}/${idStock}`, stock);
    return response.data; // Retorna el stock actualizado
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    throw error;
  }
};

// Eliminar un registro de stock
export const eliminarStock = async (idStock) => {
  try {
    const response = await axios.delete(`${STOCK_API_URL}/${idStock}`);
    return response.data; // Retorna confirmación de eliminación
  } catch (error) {
    console.error("Error al eliminar el stock:", error);
    throw error;
  }
};

// Obtener todo el stock detallado
export const obtenerTodoElStock = async () => {
  try {
    const response = await axios.get(`${STOCK_API_URL}`);
    return response.data; // Retorna todos los registros de stock
  } catch (error) {
    console.error("Error al obtener todo el stock detallado:", error);
    throw error;
  }
};

// Obtener el stock detallado por ID de pieza
export const obtenerStockPorPieza = async (idPieza) => {
  try {
    const response = await axios.get(`${STOCK_API_URL}/pieza/${idPieza}`);
    return response.data; // Retorna los registros de stock para la pieza
  } catch (error) {
    console.error("Error al obtener stock por pieza:", error);
    throw error;
  }
};

// Consultar el stock disponible (filtrado por estado "libre")
export const obtenerStockDisponible = async () => {
  try {
    const response = await axios.get(`${STOCK_API_URL}/disponible`);
    return response.data; // Retorna el stock disponible
  } catch (error) {
    console.error("Error al obtener stock disponible:", error);
    throw error;
  }
};

// Asignar stock a un proyecto
export const asignarStockAProyecto = async (idPieza, idProyecto, stockActual) => {
  try {
    const response = await axios.post(`${STOCK_API_URL}/asignar`, {
      id_pieza: idPieza,
      id_proyecto: idProyecto,
      stockActual: stockActual,
    });
    return response.data; // Retorna confirmación de asignación
  } catch (error) {
    console.error("Error al asignar stock a un proyecto:", error);
    throw error;
  }
};

// Liberar stock de un proyecto
export const liberarStockDeProyecto = async (idPieza, idProyecto, stockActual) => {
  try {
    const response = await axios.post(`${STOCK_API_URL}/liberar`, {
      id_pieza: idPieza,
      id_proyecto: idProyecto,
      stockActual: stockActual,
    });
    return response.data; // Retorna confirmación de liberación
  } catch (error) {
    console.error("Error al liberar stock de un proyecto:", error);
    throw error;
  }
};
