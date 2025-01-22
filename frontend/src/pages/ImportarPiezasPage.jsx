import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/ImportarPiezasPage.css";
import { getProveedores } from "../services/proveedoresService";
import {
  registrarPaquete,
  buscarPiezasSimilares,
  asignarStockAProyecto,
  liberarStockDeProyecto,
  getMarcas,
} from "../services/piezasService"; 
// asumiendo que ahí exportas tus funciones
import "../styles/SugerenciasContainer.css";
import debounce from "lodash.debounce";
import PiezasAgregadasTable from "../components/PiezasAgregadasTable";

const ImportarPiezasPage = () => {
  const [numeroVenta, setNumeroVenta] = useState(""); 
  const [proveedor, setProveedor] = useState(""); 
  const [notas, setNotas] = useState(""); 
  const [listaProveedores, setListaProveedores] = useState([]); 

  // Estado local para la pieza que estás por agregar
  const [nuevaPieza, setNuevaPieza] = useState({
    ID_Pieza: "", 
    cantidad: "",
    descripcion: "",
    marca: "",
    fechaRegistro: "",
    noProyecto: "",
    n_venta: "", 
  });

  // Lista de piezas agregadas a la "compra"
  const [piezasAgregadas, setPiezasAgregadas] = useState([]); 

  const [marcas, setMarcas] = useState([]); 
  const [sugerencias, setSugerencias] = useState([]); 

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log("Cargando marcas y proveedores...");

        // Obtener marcas
        const dataMarcas = await getMarcas();
        if (Array.isArray(dataMarcas)) {
          setMarcas(dataMarcas);
        } else {
          console.error("Respuesta inválida para marcas:", dataMarcas);
          setMarcas([]);
        }

        // Obtener proveedores
        const dataProveedores = await getProveedores();
        if (Array.isArray(dataProveedores)) {
          setListaProveedores(dataProveedores);
        } else {
          console.error("Respuesta inválida para proveedores:", dataProveedores);
          setListaProveedores([]);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMarcas([]);
        setListaProveedores([]);
      }
    };

    cargarDatos();
  }, []);

  // Función de debounce para la búsqueda
  const debouncedFetchSugerencias = useCallback(
    debounce(async (filters) => {
      try {
        const data = await buscarPiezasSimilares(filters);
        setSugerencias(data);
      } catch (error) {
        console.error("Error al buscar sugerencias:", error);
      }
    }, 300),
    []
  );

  // Maneja cambios en los inputs y también autocompletado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPieza((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Construir filtros para buscar piezas similares
    const filters = {
      ID_Pieza: name === "ID_Pieza" ? value : nuevaPieza.ID_Pieza,
      descripcion: name === "descripcion" ? value : nuevaPieza.descripcion,
      marca: name === "marca" ? value : nuevaPieza.marca,
    };

    debouncedFetchSugerencias(filters);
  };

  // Botón "Agregar" (agrega la pieza a la tabla local)
  const handleAgregarPieza = () => {
    console.log("Estado actual de nuevaPieza:", nuevaPieza);

    // Sincronizar n_venta con 'numeroVenta'
    const piezaConVenta = {
      ...nuevaPieza,
      n_venta: numeroVenta || nuevaPieza.n_venta,
    };

    // Validar campos obligatorios
    if (
      !piezaConVenta.ID_Pieza || 
      !piezaConVenta.cantidad ||
      !piezaConVenta.descripcion ||
      !piezaConVenta.marca ||
      !piezaConVenta.n_venta
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Armar objeto para mostrar en la tabla local
    const piezaAAgregar = {
      ID_Pieza: piezaConVenta.ID_Pieza,
      descripcion: piezaConVenta.descripcion,
      cantidad: parseInt(piezaConVenta.cantidad, 10),
      marca: piezaConVenta.marca,
      n_venta: parseInt(piezaConVenta.n_venta, 10),
      noProyecto: piezaConVenta.noProyecto || "",
      fechaRegistro: piezaConVenta.fechaRegistro || "",
    };

    console.log("Pieza que se agregará al array local:", piezaAAgregar);

    // Agregar al array de piezas
    setPiezasAgregadas((prev) => [...prev, piezaAAgregar]);

    // Limpiar formulario
    setNuevaPieza({
      ID_Pieza: "",
      cantidad: "",
      descripcion: "",
      marca: "",
      fechaRegistro: "",
      noProyecto: "",
      n_venta: "",
    });
    setSugerencias([]);
  };

  // Botón "Confirmar Compra"
  const handleRegistrarCompra = async () => {
    if (!proveedor || piezasAgregadas.length === 0) {
      alert("Por favor, selecciona un proveedor y agrega al menos una pieza.");
      return;
    }

    try {
      // Construye el paquete para enviarlo al backend
      const paquete = {
        proveedor,  
        notas,
        piezas: piezasAgregadas.map((pieza) => ({
          id_pieza: pieza.ID_Pieza,
          cantidad: pieza.cantidad,
          n_venta: pieza.n_venta,
          id_proyecto: pieza.noProyecto || null,
          // Si en tu backend se requiere "marca" o "descripcion", agrégalo aquí
        })),
      };

      console.log("Paquete a enviar al backend:", paquete);

      // Llamar al servicio que registra el paquete en la BD
      const response = await registrarPaquete(paquete);
      alert(response.message || "Compra registrada exitosamente.");

      // Resetear campos
      setNumeroVenta("");
      setProveedor("");
      setNotas("");
      setPiezasAgregadas([]);
      setNuevaPieza({
        ID_Pieza: "",
        cantidad: "",
        descripcion: "",
        marca: "",
        fechaRegistro: "",
        noProyecto: "",
        n_venta: "",
      });
    } catch (error) {
      console.error("Error al registrar el paquete:", error);
      alert("Ocurrió un error al registrar el paquete.");
    }
  };

  // Manejar "Actualizar Stock" desde las sugerencias
  const handleActualizarStock = (pieza) => {
    setNuevaPieza({
      ...nuevaPieza,
      ID_Pieza: pieza.ID_Pieza,
      descripcion: pieza.Descripcion,
      marca: pieza.Marca,
    });
  };

  // Asignar stock a un proyecto (usa la lógica actual, solo renombra 'stockActual' => 'cantidad')
  const handleAsignarStock = async (pieza) => {
    if (!pieza.noProyecto || !pieza.cantidad) {
      alert("Por favor, ingresa un proyecto y una cantidad válida.");
      return;
    }

    try {
      await asignarStockAProyecto(pieza.ID_Pieza, pieza.noProyecto, pieza.cantidad);
      alert("Stock asignado exitosamente.");
    } catch (error) {
      console.error("Error al asignar stock:", error);
      alert("No se pudo asignar el stock.");
    }
  };

  // Liberar stock de un proyecto
  const handleLiberarStock = async (pieza) => {
    if (!pieza.noProyecto || !pieza.cantidad) {
      alert("Por favor, ingresa un proyecto y una cantidad válida.");
      return;
    }

    try {
      await liberarStockDeProyecto(pieza.ID_Pieza, pieza.noProyecto, pieza.cantidad);
      alert("Stock liberado exitosamente.");
    } catch (error) {
      console.error("Error al liberar stock:", error);
      alert("No se pudo liberar el stock.");
    }
  };

  return (
    <div className="importar-piezas-page">
      <button
        className="dashboard-back-button"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Regresar al Dashboard
      </button>

      <Header title="Importar Piezas" />

      <div className="importar-piezas-main">
        <div className="formulario-container">
          {/* Sección de datos de la "compra" */}
          <div className="formulario-venta">
            <label>No. Venta:</label>
            <input
              type="text"
              name="numeroVenta"
              value={numeroVenta}
              onChange={(e) => {
                setNumeroVenta(e.target.value);
                // De paso, sincronizar con el estado de nuevaPieza
                setNuevaPieza((prev) => ({
                  ...prev,
                  n_venta: e.target.value,
                }));
              }}
              placeholder="Ingrese el número de venta"
            />

            <label>Proveedor:</label>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
            >
              <option value="">Selecciona un proveedor</option>
              {listaProveedores.map((prov) => (
                <option key={prov.ID_Proveedor} value={prov.ID_Proveedor}>
                  {prov.Nombre}
                </option>
              ))}
            </select>

            <label>Notas:</label>
            <input
              type="text"
              name="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ingrese notas (opcional)"
            />
          </div>

          {/* Sección de datos de la pieza a agregar */}
          <div className="formulario-pieza">
            <input
              type="text"
              name="ID_Pieza"
              value={nuevaPieza.ID_Pieza}
              onChange={handleChange}
              placeholder="No. Parte"
            />
            <input
              type="number"
              name="cantidad"
              value={nuevaPieza.cantidad}
              onChange={handleChange}
              placeholder="Cantidad"
            />
            <input
              type="text"
              name="descripcion"
              value={nuevaPieza.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
            />
            <input
              type="text"
              name="marca"
              value={nuevaPieza.marca}
              onChange={handleChange}
              placeholder="Escribe la marca"
            />
            <input
              type="date"
              name="fechaRegistro"
              value={nuevaPieza.fechaRegistro}
              onChange={handleChange}
            />
            <input
              type="text"
              name="noProyecto"
              value={nuevaPieza.noProyecto}
              onChange={handleChange}
              placeholder="No. Proyecto (opcional)"
            />
            <button onClick={handleAgregarPieza} className="agregar-boton">
              Agregar
            </button>
          </div>
        </div>

        {/* Sugerencias de piezas similares */}
        <div className="sugerencias-container">
          {sugerencias.length > 0 ? (
            <>
              <h3>Piezas Similares Encontradas</h3>
              <ul>
                {sugerencias.map((pieza) => (
                  <li key={pieza.ID_Pieza}>
                    <span>{pieza.Descripcion}</span>
                    <button
                      className="actualizar-stock-boton"
                      onClick={() => handleActualizarStock(pieza)}
                    >
                      Actualizar Stock
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>
              <h3>No se encontraron piezas similares.</h3>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Piezas Agregadas */}
      <div className="piezas-agregadas-section">
        <h3>Piezas Agregadas</h3>
        <PiezasAgregadasTable
          piezas={piezasAgregadas}
          setPiezas={setPiezasAgregadas}
          onAsignarStock={handleAsignarStock}
          onLiberarStock={handleLiberarStock}
        />
        <button onClick={handleRegistrarCompra} className="confirmar-compra-boton">
          Confirmar Compra
        </button>
      </div>
    </div>
  );
};

export default ImportarPiezasPage;
