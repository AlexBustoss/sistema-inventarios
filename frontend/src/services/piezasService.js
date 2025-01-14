import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000"; // Ajusta según tu backend

// Rutas base
const API_URL = "/api/piezas";        // Endpoints para el catálogo de piezas
const COMPRAS_API_URL = "/api/compras"; 
const MARCAS_API_URL = "/api/marcas_piezas"; 
const UBICACIONES_API_URL = "/api/ubicaciones_proveedores"; 
const STOCK_DETALLADO_API_URL = "/api/stock_detallado"; // Si tuvieras un endpoint REST para stock_detallado

//------------------------------------------------------
// 1. getMarcas (si lo sigues usando)
//------------------------------------------------------
export const getMarcas = async () => {
  try {
    const response = await axios.get(MARCAS_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return [];
  }
};

//------------------------------------------------------
// 2. Obtener todas las piezas (catálogo)
//------------------------------------------------------
export const getAllPiezas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las piezas:", error);
    throw error;
  }
};

//------------------------------------------------------
// 3. Obtener piezas con "bajo stock"
//    Ahora se calcula en stock_detallado, 
//    o en el endpoint /bajo-stock que creaste en el backend
//------------------------------------------------------
export const getLowStockPiezas = async () => {
  try {
    const response = await axios.get(`${API_URL}/bajo-stock`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener piezas con bajo stock:", error);
    throw error;
  }
};

//------------------------------------------------------
// 4. Agregar una nueva pieza (catálogo) Y registrar su stock en stock_detallado
//    (Si lo deseas) 
//------------------------------------------------------
export const addNewPieza = async (pieza) => {
  try {
    console.log("Datos recibidos en addNewPieza:", pieza);

    // (Opcional) Validar o crear marca
    const idMarca = await validarOAgregarMarca(pieza.marca);

    // (Opcional) Validar o crear ubicación en otra tabla (si la sigues usando):
    // const idUbicacion = await validarOAgregarUbicacion(pieza.ubicacion);

    // 1. Crear la pieza en la tabla "piezas" (solo Descripcion, Marca, etc.)
    const responsePieza = await axios.post(API_URL, {
      // Estos campos deben coincidir con lo que tu backend espera para crear la pieza
      descripcion: pieza.descripcion,
      marca: idMarca, // O la marca string si ya no usas ID
      // estado: pieza.estado || "libre",   // Opcional
      // n_venta: pieza.nVenta || null,     // Opcional
      // Ubicación y stock no se guardan aquí
    });
    console.log("Respuesta al agregar pieza (catálogo):", responsePieza.data);

    const idPieza = responsePieza.data.ID_Pieza; // ID devuelto por el backend

    // 2. Registrar el stock inicial en la tabla `stock_detallado`
    const cantidad = Number(pieza.cantidad || 0); 
    const estado = pieza.estado || "libre";
    const idProyecto = pieza.noProyecto || null;

    // El ID del proveedor, si aplica
    const idProveedor = pieza.proveedor || null;

    const responseStock = await axios.post(STOCK_DETALLADO_API_URL, {
      id_pieza: idPieza,
      id_proyecto: idProyecto,
      id_proveedor: idProveedor,
      cantidad,
      estado,
    });
    console.log("Respuesta al registrar stock en stock_detallado:", responseStock.data);

    return responsePieza.data;
  } catch (error) {
    console.error("Error al agregar nueva pieza:", error);
    throw error;
  }
};

//------------------------------------------------------
// 5. Actualizar una pieza (catálogo)
//------------------------------------------------------
export const updatePieza = async (id, pieza) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, pieza);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    throw error;
  }
};

//------------------------------------------------------
// 6. Eliminar pieza (catálogo)
//------------------------------------------------------
export const deletePieza = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error al eliminar la pieza:", error);
    throw error;
  }
};

//------------------------------------------------------
// 7. Buscar piezas similares (por Descripcion, Marca, ID_Pieza, etc.)
//------------------------------------------------------
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

//------------------------------------------------------
// 8. Asociar piezas a una compra (si aún lo usas)
//    O elimina si ya no lo necesitas
//------------------------------------------------------
export const asociarPiezasCompra = async (nVenta, piezas) => {
  try {
    const response = await axios.post(`${API_URL}/asociar-compra/${nVenta}`, { piezas });
    return response.data;
  } catch (error) {
    console.error("Error al asociar piezas a la compra:", error);
    throw error;
  }
};

//------------------------------------------------------
// 9. Registrar una compra (llama a /api/compras)
//------------------------------------------------------
export const registrarCompra = async (compraData) => {
  try {
    const response = await axios.post(COMPRAS_API_URL, compraData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar la compra:", error);
    throw error;
  }
};

//------------------------------------------------------
// 10. Asignar stock a un proyecto
//     Renombramos "stockActual" => "cantidad"
//------------------------------------------------------
export const asignarStockAProyecto = async (idPieza, idProyecto, cantidad) => {
  try {
    const response = await axios.post(`${API_URL}/asignar-stock`, {
      id_pieza: Number(idPieza),
      id_proyecto: Number(idProyecto),
      cantidad: Number(cantidad), // Ojo: renombrado
    });
    return response.data;
  } catch (error) {
    console.error("Error al asignar stock al proyecto:", error);
    throw error;
  }
};

//------------------------------------------------------
// 11. Liberar stock de un proyecto
//     Igual, cambiar "stockActual" => "cantidad"
//------------------------------------------------------
export const liberarStockDeProyecto = async (idPieza, idProyecto, cantidad) => {
  try {
    const response = await axios.post(`${API_URL}/liberar-stock`, {
      id_pieza: Number(idPieza),
      id_proyecto: Number(idProyecto),
      cantidad: Number(cantidad),
    });
    return response.data;
  } catch (error) {
    console.error("Error al liberar stock del proyecto:", error);
    throw error;
  }
};

//------------------------------------------------------
// 12. Registrar un "paquete" de piezas (POST /api/piezas/registrar-paquete)
//     Ajusta si tu backend cambió su ruta o body
//------------------------------------------------------
export const registrarPaquete = async (paquete) => {
  try {
    const response = await axios.post(`${API_URL}/registrar-paquete`, paquete);
    return response.data;
  } catch (error) {
    console.error("Error al registrar el paquete:", error);
    throw error;
  }
};

//------------------------------------------------------
// 13. (Opcional) Validar o agregar marca
//------------------------------------------------------
const validarOAgregarMarca = async (marca) => {
  try {
    const response = await axios.post(`${MARCAS_API_URL}/validar-o-crear`, {
      nombre: marca
    });
    return response.data.id_marca; // Ajusta según respuesta real del backend
  } catch (error) {
    console.error("Error al validar o agregar la marca:", error);
    throw error;
  }
};

//------------------------------------------------------
// 14. (Opcional) Validar o agregar ubicación 
//     (Solo si realmente la usas en otra tabla, no en "piezas" ya)
//------------------------------------------------------
const validarOAgregarUbicacion = async (ubicacion) => {
  try {
    const response = await axios.post(`${UBICACIONES_API_URL}/validar-o-crear`, {
      nombre: ubicacion
    });
    return response.data.id_ubicacion || null;
  } catch (error) {
    console.warn("Advertencia al validar/agregar ubicación:", error.message);
    return null;
  }
};


export const getPiezasWithStock = async () => {
  const response = await axios.get("/api/piezas/with-stock");
  return response.data; // Devuelve [{ ID_Pieza, Descripcion, Marca, stockLibre }, ...]
};

// Función para agregar una nueva pieza al catálogo
export const addNewCatalogPieza = async ({ descripcion, marca }) => {
  const response = await axios.post("/api/piezas", {
    descripcion,
    marca
  });
  return response.data; // { ID_Pieza, Descripcion, Marca, ... }
};

