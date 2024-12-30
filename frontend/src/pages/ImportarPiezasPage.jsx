import React, { useState, useCallback } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/ImportarPiezasPage.css";
import {
  addNewPieza,
  buscarPiezasSimilares,
  registrarCompra,
  asociarPiezasCompra,
} from "../services/piezasService"; // Importa las nuevas funciones
import "../styles/SugerenciasContainer.css";
import debounce from "lodash.debounce";
import PiezasAgregadasTable from "../components/PiezasAgregadasTable";


const ImportarPiezasPage = () => {
  const [numeroVenta, setNumeroVenta] = useState(""); // Campo para No. Venta
  const [proveedor, setProveedor] = useState(""); // Campo para Proveedor
  const [notas, setNotas] = useState(""); // Campo para Notas de la compra
  const [nuevaPieza, setNuevaPieza] = useState({
    noParte: "",
    cantidad: "",
    descripcion: "",
    marca: "",
    fechaRegistro: "",
    noProyecto: "",
  });
  const [piezasAgregadas, setPiezasAgregadas] = useState([]); // Almacenar piezas agregadas
  const [sugerencias, setSugerencias] = useState([]); // Almacenar piezas sugeridas
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false); // Confirmación

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
  const handleAgregarPieza = () => {
    if (
      !nuevaPieza.noParte ||
      !nuevaPieza.cantidad ||
      !nuevaPieza.descripcion ||
      !nuevaPieza.marca ||
      !nuevaPieza.fechaRegistro
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    const piezaConProveedor = {
      ...nuevaPieza,
      proveedor, // Incluye el proveedor en la pieza agregada
    };
  
    setPiezasAgregadas((prev) => [...prev, piezaConProveedor]); // Usa piezaConProveedor
    setNuevaPieza({
      noParte: "",
      cantidad: "",
      descripcion: "",
      marca: "",
      fechaRegistro: "",
      noProyecto: "",
    });
    setSugerencias([]); // Limpiar sugerencias
  };
  

  // Confirmar y registrar la compra junto con las piezas asociadas
  const handleRegistrarCompra = async () => {
    if (!numeroVenta || !proveedor || piezasAgregadas.length === 0) {
      alert("Por favor, completa todos los campos de la compra y agrega al menos una pieza.");
      return;
    }

    try {
      const compraData = {
        Proveedor: proveedor,
        Notas: notas,
      };

      // Registrar la compra
      const compra = await registrarCompra(compraData);

      // Asociar las piezas a la compra registrada
      const piezas = piezasAgregadas.map((pieza) => ({
        noParte: pieza.noParte,
        cantidad: pieza.cantidad,
      }));

      await asociarPiezasCompra(compra.n_venta, piezas);

      alert("Compra y piezas registradas con éxito.");
      setNumeroVenta("");
      setProveedor("");
      setNotas("");
      setPiezasAgregadas([]);
    } catch (error) {
      console.error("Error al registrar la compra:", error);
      alert("Ocurrió un error al registrar la compra.");
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
            <input
              type="text"
              name="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Ingrese el proveedor"
            />
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
            <input
              type="text"
              name="marca"
              value={nuevaPieza.marca}
              onChange={handleChange}
              placeholder="Marca"
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

        <div className="sugerencias-container">
          {sugerencias.length > 0 && (
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
          )}
        </div>
      </div>

      <div className="piezas-agregadas-section">
        <h3>Piezas Agregadas</h3>
        <PiezasAgregadasTable piezas={piezasAgregadas} setPiezas={setPiezasAgregadas} />
        <button onClick={handleRegistrarCompra} className="confirmar-compra-boton">
          Confirmar Compra
        </button>
      </div>
    </div>
  );
};

export default ImportarPiezasPage;
