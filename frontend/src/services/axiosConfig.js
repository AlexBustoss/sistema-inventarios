import axios from 'axios';

// Configuración global de Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Asegúrate de que el backend tiene esta URL
});

export default axiosInstance;
