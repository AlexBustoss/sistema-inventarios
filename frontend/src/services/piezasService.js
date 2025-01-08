import axios from "axios";

const API_URL = "http://localhost:3000/api/piezas"; // Reemplaza con tu URL del backend si es diferente
const COMPRAS_API_URL = "http://localhost:3000/api/compras"; // API para compras
const MARCAS_API_URL = "http://localhost:3000/api/marcas_piezas";
const UBICACIONES_API_URL = "http://localhost:3000/api/ubicaciones_proveedores";
axios.defaults.baseURL = "http://localhost:3000"; // Configura el backend


export const getMarcas = async () => {
  try {
    const response = await axios.get('/api/marcas_piezas');
    return response.data; // Devolver directamente los datos
  } catch (error) {
    console.error("Error al obtener marcas desde el backend:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};




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
    // Validar o agregar marca
    const idMarca = await validarOAgregarMarca(pieza.marca);

    // Validar o agregar ubicación
    const idUbicacion = await validarOAgregarUbicacion(pieza.ubicacion);

    // Agregar la nueva pieza
    const response = await axios.post(API_URL, {
      noParte: pieza.noParte,
      descripcion: pieza.descripcion,
      cantidad: pieza.cantidad,
      proveedor: pieza.proveedor,
      ubicacion: idUbicacion, // Usar el ID de la ubicación
      stockMinimo: pieza.stockMinimo,
      marca: idMarca, // Usar el ID de la marca
      estado: pieza.estado || "libre", // Valor predeterminado
    });

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

// Asignar stock a un proyecto
export const asignarStockAProyecto = async (idPieza, idProyecto, cantidad) => {
  try {
    const response = await axios.post(`${API_URL}/asignar-stock`, {
      id_pieza: Number(idPieza), // Convierte a número
      id_proyecto: Number(idProyecto), // Convierte a número
      cantidad: Number(cantidad), // Convierte a número
    });
    return response.data;
  } catch (error) {
    console.error("Error al asignar stock al proyecto:", error);
    throw error;
  }
};


// Liberar stock de un proyecto
export const liberarStockDeProyecto = async (idPieza, idProyecto, cantidad) => {
  try {
    const response = await axios.post(`${API_URL}/liberar-stock`, {
      idPieza,
      idProyecto,
      cantidad,
    });
    return response.data; // Retorna mensaje de éxito
  } catch (error) {
    console.error("Error al liberar stock del proyecto:", error);
    throw error;
  }
};

export const registrarPaquete = async (paquete) => {
  try {
      const response = await axios.post(`${API_URL}/registrar-paquete`, paquete);
      return response.data;
  } catch (error) {
      console.error("Error al registrar el paquete:", error);
      throw error;
  }
};

const validarOAgregarMarca = async (marca) => {
  try {
    const response = await axios.post(`${MARCAS_API_URL}/validar-o-crear`, { nombre: marca });
    return response.data.id_marca; // Retorna el ID de la marca
  } catch (error) {
    console.error("Error al validar o agregar la marca:", error);
    throw error;
  }
};

const validarOAgregarUbicacion = async (ubicacion) => {
  try {
    const response = await axios.post(`${UBICACIONES_API_URL}/validar-o-crear`, { nombre: ubicacion });
    return response.data.id_ubicacion; // Retorna el ID de la ubicación
  } catch (error) {
    console.error("Error al validar o agregar la ubicación:", error);
    throw error;
  }
};


