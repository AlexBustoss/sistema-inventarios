import axios from "axios";

const API_URL = "http://localhost:3000/api/piezas"; // Reemplaza con tu URL del backend si es diferente

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
