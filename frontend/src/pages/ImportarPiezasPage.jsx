import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/ImportarPiezasPage.css";
import { registrarPaquete } from "../services/piezasService";
import {
  addNewPieza,
  buscarPiezasSimilares,
  registrarCompra,
  asociarPiezasCompra,
  asignarStockAProyecto,
  liberarStockDeProyecto,
  getMarcas,
} from "../services/piezasService"; // Importa las nuevas funciones
import "../styles/SugerenciasContainer.css";
import debounce from "lodash.debounce";
import PiezasAgregadasTable from "../components/PiezasAgregadasTable";
import { getProveedores } from "../services/proveedoresService";


const ImportarPiezasPage = () => {
  const [numeroVenta, setNumeroVenta] = useState(""); // Campo para No. Venta
  const [proveedor, setProveedor] = useState(""); // Campo para Proveedor
  const [notas, setNotas] = useState(""); // Campo para Notas de la compra
  const [listaProveedores, setListaProveedores] = useState([]); // Estado para guardar proveedores
  const [nuevaPieza, setNuevaPieza] = useState({
    noParte: "",
    cantidad: "",
    descripcion: "",
    marca: "",
    fechaRegistro: "",
    noProyecto: "",
    nVenta: "",
    ubicacion: "", 
    stockMinimo: "",
  });
  const [piezasAgregadas, setPiezasAgregadas] = useState([]); // Almacenar piezas agregadas
  const [sugerencias, setSugerencias] = useState([]); // Almacenar piezas sugeridas
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false); // Confirmación
  const [mostrarFormularioNuevaPieza, setMostrarFormularioNuevaPieza] = useState(false); // Controla si se muestra el formulario dinámico
  const [nuevaPiezaCompleta, setNuevaPiezaCompleta] = useState({
    noParte: "",
    descripcion: "",
    marca: "",
    cantidad: "",
    proveedor: "",
    ubicacion: "",
    stockMinimo: "",
    estado: "Libre",
    nVenta: "", 
    noProyecto: "",
  });
  const [nVenta, setNVenta] = useState(""); // Estado para Número de Venta
  const [marcas, setMarcas] = useState([]); // Estado para guardar las marcas



  useEffect(() => {
    const cargarDatos = async () => {
      try {
  
        // Obtener marcas
        const dataMarcas = await getMarcas();
  
        if (Array.isArray(dataMarcas)) {
          setMarcas(dataMarcas); // Guardar marcas
        } else {
          console.error("Error: la respuesta de marcas no es un array. Respuesta:", dataMarcas);
          setMarcas([]); // Evita errores posteriores
        }
  
        // Obtener proveedores
        const dataProveedores = await getProveedores();
  
        if (Array.isArray(dataProveedores)) {
          setListaProveedores(dataProveedores); // Guardar proveedores
        } else {
          console.error("Error: la respuesta de proveedores no es un array. Respuesta:", dataProveedores);
          setListaProveedores([]); // Evita errores posteriores
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

  // Manejar cambios en los inputs y actualizar sugerencias
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPieza((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Llama a la búsqueda dinámica en base a los valores actuales
    const filters = {
      noParte: name === "noParte" ? value : nuevaPieza.noParte,
      descripcion: name === "descripcion" ? value : nuevaPieza.descripcion,
      marca: name === "marca" ? value : nuevaPieza.marca,
    };

    debouncedFetchSugerencias(filters);
  };

  // Agregar pieza
  const handleAgregarPieza = async () => {
    if (
      !nuevaPieza.noParte ||
      !nuevaPieza.cantidad ||
      !nuevaPieza.descripcion ||
      !nuevaPieza.marca ||
      !nuevaPieza.ubicacion ||
      !nuevaPieza.nVenta // Validación del Número de Venta obligatorio
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
  
    try {
      // Crear objeto para la pieza a enviar
      const piezaAEnviar = {
        noParte: nuevaPieza.noParte,
        descripcion: nuevaPieza.descripcion,
        cantidad: parseInt(nuevaPieza.cantidad, 10),
        marca: nuevaPieza.marca,
        ubicacion: nuevaPieza.ubicacion,
        stockMinimo: parseInt(nuevaPieza.stockMinimo, 10),
        nVenta: parseInt(nuevaPieza.nVenta, 10), // Número de Venta
        idProyecto: nuevaPieza.noProyecto ? parseInt(nuevaPieza.noProyecto, 10) : null, // Proyecto opcional
        estado: nuevaPieza.noProyecto ? "Asignada" : "Libre", // Determinar estado dinámicamente
      };
  
      console.log("Datos enviados para nueva pieza:", piezaAEnviar);
  
      // Llamar al servicio para agregar la nueva pieza
      const response = await addNewPieza(piezaAEnviar);
      alert("Pieza agregada exitosamente.");
      
      // Limpiar el formulario
      setNuevaPieza({
        noParte: "",
        cantidad: "",
        descripcion: "",
        marca: "",
        ubicacion: "",
        stockMinimo: "",
        nVenta: "",
        noProyecto: "",
      });
      setSugerencias([]); // Limpiar sugerencias
    } catch (error) {
      console.error("Error al agregar nueva pieza:", error);
  
      // Manejar errores específicos del backend
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.error || "No se pudo agregar la pieza."}`);
      } else {
        alert("Ocurrió un error al agregar la nueva pieza. Inténtalo de nuevo.");
      }
    }
  };
  

  

  // Confirmar y registrar la compra junto con las piezas asociadas
const handleRegistrarCompra = async () => {
  if (!proveedor || piezasAgregadas.length === 0) {
    alert("Por favor, completa todos los campos de la compra y agrega al menos una pieza.");
    return;
  }

  try {
    const paquete = {
      proveedor, // Aquí estamos enviando el ID del proveedor seleccionado
      notas,
      piezas: piezasAgregadas.map((pieza) => ({
        id_pieza: pieza.noParte, // ID de la pieza
        cantidad: parseInt(pieza.cantidad, 10), // Asegura que cantidad sea un número
        id_proyecto: pieza.noProyecto || null, // Si no hay proyecto, envía null
      })),
    };

    const response = await registrarPaquete(paquete); // Llama al backend para registrar el paquete

    alert(response.message); // Muestra un mensaje de éxito
    // Reinicia los campos y limpia la tabla después del registro
    setNumeroVenta("");
    setProveedor(""); // Reinicia el proveedor seleccionado
    setNotas("");
    setPiezasAgregadas([]);
  } catch (error) {
    console.error("Error al registrar el paquete:", error);
    alert("Ocurrió un error al registrar el paquete.");
  }
};

  
  

  // Nueva función: Manejar "Actualizar Stock"
  const handleActualizarStock = (pieza) => {
    setNuevaPieza((prev) => ({
      ...prev,
      descripcion: pieza.Descripcion,
      marca: pieza.Marca,
    }));
  };

  // Asignar stock a un proyecto
  const handleAsignarStock = async (pieza) => {
    if (!pieza.noProyecto || !pieza.cantidad) {
      alert("Por favor, ingresa un proyecto y una cantidad válida.");
      return;
    }

    try {
      await asignarStockAProyecto(pieza.noParte, pieza.noProyecto, pieza.cantidad);
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
      await liberarStockDeProyecto(pieza.noParte, pieza.noProyecto, pieza.cantidad);
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
          <div className="formulario-venta">
            <label>No. Venta:</label>
            <input
              type="text"
              name="numeroVenta"
              value={numeroVenta}
              onChange={(e) => setNumeroVenta(e.target.value)}
              placeholder="Ingrese el número de venta"
            />
            <label>Proveedor:</label>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)} // Guarda el ID del proveedor seleccionado
            >
              <option value="">Selecciona un proveedor</option> {/* Opción predeterminada */}
              {listaProveedores.map((proveedor) => (
                <option key={proveedor.ID_Proveedor} value={proveedor.ID_Proveedor}>
                  {proveedor.Nombre} {/* Muestra el nombre del proveedor */}
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

          <div className="formulario-pieza">

            
            <input
              type="text"
              name="noParte"
              value={nuevaPieza.noParte}
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
            <select
            name="marca"
            value={nuevaPieza.marca}
            onChange={handleChange}
          >
            <option value="">Selecciona una marca</option>
            {Array.isArray(marcas) && marcas.length > 0 ? (
              marcas.map((marca) => (
                <option key={marca.ID_Pieza} value={marca.Marca}>
                  {marca.Marca}
                </option>
              ))
            ) : (
              <option value="">No hay marcas disponibles</option>
            )}
          </select>


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
      {!mostrarFormularioNuevaPieza ? (
        <button
          className="agregar-nueva-pieza-boton"
          onClick={() => setMostrarFormularioNuevaPieza(true)}
        >
          Agregar como nueva pieza
        </button>
      ) : (
        <div className="formulario-nueva-pieza">
  <h3>Agregar Nueva Pieza</h3>
  <div className="formulario-nueva-pieza-campos">
    <label>Proveedor:</label>
    <select
      value={nuevaPiezaCompleta.proveedor}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          proveedor: e.target.value,
        })
      }
    >
      <option value="">Selecciona un proveedor</option>
      {listaProveedores.map((prov) => (
        <option key={prov.ID_Proveedor} value={prov.ID_Proveedor}>
          {prov.Nombre}
        </option>
      ))}
    </select>

    <label>No. Parte:</label>
    <input
      type="text"
      name="noParte"
      value={nuevaPiezaCompleta.noParte}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          noParte: e.target.value,
        })
      }
      placeholder="Ej: 12345"
    />

    <label>Descripción:</label>
    <input
      type="text"
      name="descripcion"
      value={nuevaPiezaCompleta.descripcion}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          descripcion: e.target.value,
        })
      }
      placeholder="Ej: Pieza de metal"
    />

<label>Marca:</label>
<select
  value={nuevaPiezaCompleta.marca}
  onChange={(e) =>
    setNuevaPiezaCompleta({
      ...nuevaPiezaCompleta,
      marca: e.target.value,
    })
  }
>
  <option value="">Selecciona una marca</option> {/* Opción predeterminada */}
  {marcas.map((marca, index) => {
    console.log("Iterando sobre marcas para el dropdown:", marca);
    return (
      <option key={index} value={marca.Marca}>
        {marca.Marca} {/* Mostrar el nombre de la marca */}
      </option>
    );
  })}
</select>






    <label>Ubicación:</label>
    <input
      type="text"
      name="ubicacion"
      value={nuevaPiezaCompleta.ubicacion}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          ubicacion: e.target.value,
        })
      }
      placeholder="Ej: Estante A"
    />

    <label>Stock Mínimo:</label>
    <input
      type="number"
      name="stockMinimo"
      value={nuevaPiezaCompleta.stockMinimo}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          stockMinimo: e.target.value,
        })
      }
      placeholder="Ej: 10"
    />

    <label>Cantidad Inicial:</label>
    <input
      type="number"
      name="cantidad"
      value={nuevaPiezaCompleta.cantidad}
      onChange={(e) =>
        setNuevaPiezaCompleta({
          ...nuevaPiezaCompleta,
          cantidad: e.target.value,
        })
      }
      placeholder="Ej: 50"
    />

<label>Número de Venta:</label>
<input
  type="text"
  name="nVenta"
  value={nuevaPiezaCompleta.nVenta}
  onChange={(e) =>
    setNuevaPiezaCompleta({
      ...nuevaPiezaCompleta,
      nVenta: e.target.value,
    })
  }
  placeholder="Ej: 123"
/>

<label>Número de Proyecto (opcional):</label>
<input
  type="text"
  name="noProyecto"
  value={nuevaPiezaCompleta.noProyecto}
  onChange={(e) =>
    setNuevaPiezaCompleta({
      ...nuevaPiezaCompleta,
      noProyecto: e.target.value,
    })
  }
  placeholder="Ej: 456"
/>

  </div>

  <div className="formulario-nueva-pieza-botones">
    <button
      className="confirmar-nueva-pieza-boton"
      onClick={async () => {
        try {
          console.log("Datos enviados para nueva pieza:", nuevaPiezaCompleta);
          await addNewPieza(nuevaPiezaCompleta);
          alert("Pieza agregada exitosamente.");
          setMostrarFormularioNuevaPieza(false);
          setNuevaPiezaCompleta({
            noParte: "",
            descripcion: "",
            marca: "",
            cantidad: "",
            proveedor: "",
            ubicacion: "",
            stockMinimo: "",
            estado: "Libre",
          });
          debouncedFetchSugerencias({
            noParte: nuevaPiezaCompleta.noParte,
          });
        } catch (error) {
          console.error("Error al agregar nueva pieza:", error);
          alert("Error al agregar la nueva pieza.");
        }
      }}
    >
      Confirmar
    </button>
    <button
      className="cancelar-nueva-pieza-boton"
      onClick={() => setMostrarFormularioNuevaPieza(false)}
    >
      Cancelar
    </button>
  </div>
</div>


      )}
    </div>
  )}
</div>

      </div>

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
