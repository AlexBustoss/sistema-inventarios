import axiosInstance from './axiosConfig'; // Importa la configuración de Axios

// Servicio para obtener todos los proveedores
export const getProveedores = async () => {
  try {
    const response = await axiosInstance.get('/proveedores'); // Endpoint para obtener proveedores
    return response.data; // Devuelve la lista de proveedores
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error; // Lanza el error para manejarlo en el frontend
  }
};

// Servicio para obtener el conteo de proveedores activos
export const getProveedorCount = async () => {
  try {
    const response = await axiosInstance.get('/proveedores/count'); // La baseURL ya está configurada
    console.log('Respuesta completa de Axios:', response);
    return response.data.total;
  } catch (error) {
    console.error('Error al obtener el conteo de proveedores activos:', error);
    return 0; // Retorna 0 en caso de error
  }
};
