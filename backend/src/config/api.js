import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Cambia esto si usas otro puerto o dominio
});

export default api;
