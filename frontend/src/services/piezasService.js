import axios from "axios";

const API_URL = "http://localhost:3000/api/piezas"; // Reemplaza con tu URL del backend si es diferente
const COMPRAS_API_URL = "http://localhost:3000/api/compras"; // API para compras

// Obtener todas las piezas
export const getAllPiezas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las piezas:", error);
    throw error;
  }
};

// Obtener piezas con bajo stock
export const getLowStockPiezas = async () => {
  try {
    const response = await axios.get(`${API_URL}/bajo-stock`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener piezas con bajo stock:", error);
    throw error;
  }
};

// Agregar nueva pieza
export const addNewPieza = async (pieza) => {
  try {
    const response = await axios.post(API_URL, pieza);
    return response.data; // Retorna la pieza creada
  } catch (error) {
    console.error("Error al agregar una nueva pieza:", error);
    throw error;
  }
};

// Actualizar una pieza existente
export const updatePieza = async (id, pieza) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, pieza);
    return response.data; // Retorna la pieza actualizada
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    throw error;
  }
};

// Eliminar una pieza
export const deletePieza = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error al eliminar la pieza:", error);
    throw error;
  }
};

// Buscar piezas similares
export const buscarPiezasSimilares = async (params) => {
  try {
    const filteredParams = {};
    for (const key in params) {
      if (params[key]) {
        filteredParams[key] = params[key];
      }
    }

    const response = await axios.get(`${API_URL}/similares`, { params: filteredParams });
    return response.data;
  } catch (error) {
    console.error("Error al buscar piezas similares:", error);
    throw error;
  }
};

// Función para asociar piezas a una compra
export const asociarPiezasCompra = async (nVenta, piezas) => {
  try {
    const response = await axios.post(`/api/piezas/asociar-compra/${nVenta}`, { piezas });
    return response.data;
  } catch (error) {
    console.error("Error al asociar piezas a la compra:", error);
    throw error;
  }
};

// Registrar una nueva compra
export const registrarCompra = async (compraData) => {
  try {
    const response = await axios.post(COMPRAS_API_URL, compraData);
    return response.data; // Retorna los datos de la compra registrada
  } catch (error) {
    console.error("Error al registrar la compra:", error);
    throw error;
  }
};
