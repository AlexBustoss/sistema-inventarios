import axiosInstance from './axiosConfig'; // Importa la configuración de Axios

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
