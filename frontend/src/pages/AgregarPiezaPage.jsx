import React, { useState, useEffect } from "react";
import "../styles/FormularioAgregarPieza.css"; // Si es necesario, crea este archivo
import { addNewPieza, getMarcas } from "../services/piezasService";
import { getProveedores } from "../services/proveedoresService";

const AgregarPiezaPage = () => {
  const [nuevaPieza, setNuevaPieza] = useState({
    noParte: "",
    descripcion: "",
    marca: "",
    stockActual: "",
    proveedor: "",
    ubicacion: "",
    stockMinimo: "",
    estado: "Libre",
    nVenta: "",
    noProyecto: "",
  });
  const [marcas, setMarcas] = useState([]);
  const [listaProveedores, setListaProveedores] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const dataMarcas = await getMarcas();
        const dataProveedores = await getProveedores();
        setMarcas(dataMarcas || []);
        setListaProveedores(dataProveedores || []);
      } catch (error) {
        console.error("Error al cargar marcas o proveedores:", error);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPieza((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarPieza = async () => {
    try {
      await addNewPieza(nuevaPieza);
      alert("Pieza agregada exitosamente.");
      setNuevaPieza({
        noParte: "",
        descripcion: "",
        marca: "",
        stockActual: "",
        proveedor: "",
        ubicacion: "",
        stockMinimo: "",
        estado: "Libre",
        nVenta: "",
        noProyecto: "",
      });
    } catch (error) {
      console.error("Error al agregar la pieza:", error);
      alert("Error al agregar la pieza.");
    }
  };

  return (
    <div className="agregar-pieza-page">
      <h1>Agregar Nueva Pieza</h1>
      <div className="formulario-agregar-pieza">
        <label>Proveedor:</label>
        <select name="proveedor" value={nuevaPieza.proveedor} onChange={handleChange}>
          <option value="">Selecciona un proveedor</option>
          {listaProveedores.map((prov) => (
            <option key={prov.ID_Proveedor} value={prov.ID_Proveedor}>
              {prov.Nombre}
            </option>
          ))}
        </select>

        <label>No. Parte:</label>
        <input type="text" name="noParte" value={nuevaPieza.noParte} onChange={handleChange} />

        <label>Descripción:</label>
        <input type="text" name="descripcion" value={nuevaPieza.descripcion} onChange={handleChange} />

        <label>Marca:</label>
        <select name="marca" value={nuevaPieza.marca} onChange={handleChange}>
          <option value="">Selecciona una marca</option>
          {marcas.map((marca, index) => (
            <option key={index} value={marca.Marca}>
              {marca.Marca}
            </option>
          ))}
        </select>

        <label>Ubicación:</label>
        <input type="text" name="ubicacion" value={nuevaPieza.ubicacion} onChange={handleChange} />

        <label>Stock Inicial:</label>
        <input type="number" name="stockActual" value={nuevaPieza.stockActual} onChange={handleChange} />

        <label>Stock Mínimo:</label>
        <input type="number" name="stockMinimo" value={nuevaPieza.stockMinimo} onChange={handleChange} />

        <label>Número de Venta:</label>
        <input type="text" name="nVenta" value={nuevaPieza.nVenta} onChange={handleChange} />

        <label>Número de Proyecto (opcional):</label>
        <input type="text" name="noProyecto" value={nuevaPieza.noProyecto} onChange={handleChange} />

        <button onClick={handleAgregarPieza}>Agregar Pieza</button>
      </div>
    </div>
  );
};

export default AgregarPiezaPage;
