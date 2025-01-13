import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { addNewPieza, buscarPiezasSimilares } from "../services/piezasService";

const AgregarNuevaPieza = () => {
  const [nuevaPieza, setNuevaPieza] = useState({
    ID_Pieza: "",
    stockActual: "",
    descripcion: "",
    marca: "",
    fechaRegistro: "",
    noProyecto: "",
    nVenta: "",
    ubicacion: "",
    stockMinimo: "",
  });
  const [sugerencias, setSugerencias] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPieza((prev) => ({
      ...prev,
      [name]: value,
    }));

    const filters = {
      ID_Pieza: name === "ID_Pieza" ? value : nuevaPieza.ID_Pieza,
      descripcion: name === "descripcion" ? value : nuevaPieza.descripcion,
      marca: name === "marca" ? value : nuevaPieza.marca,
    };

    debouncedFetchSugerencias(filters);
  };

  const handleAgregarPieza = async () => {
    if (!nuevaPieza.ID_Pieza || !nuevaPieza.stockActual || !nuevaPieza.descripcion || !nuevaPieza.marca) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const piezaAEnviar = {
        ID_Pieza: nuevaPieza.ID_Pieza,
        descripcion: nuevaPieza.descripcion,
        stockActual: parseInt(nuevaPieza.stockActual, 10),
        marca: nuevaPieza.marca,
        ubicacion: nuevaPieza.ubicacion,
        stockMinimo: parseInt(nuevaPieza.stockMinimo, 10) || 0,
        nVenta: parseInt(nuevaPieza.nVenta, 10),
        idProyecto: nuevaPieza.noProyecto ? parseInt(nuevaPieza.noProyecto, 10) : null,
      };

      console.log("Datos enviados para nueva pieza:", piezaAEnviar);

      await addNewPieza(piezaAEnviar);
      alert("Pieza agregada exitosamente.");
      setNuevaPieza({
        ID_Pieza: "",
        stockActual: "",
        descripcion: "",
        marca: "",
        ubicacion: "",
        stockMinimo: "",
        nVenta: "",
        noProyecto: "",
      });
      setSugerencias([]);
    } catch (error) {
      console.error("Error al agregar nueva pieza:", error);
      alert("Ocurrió un error al agregar la nueva pieza.");
    }
  };

  return (
    <div>
      <div className="formulario-pieza">
        {/* Copia aquí el HTML de inputs */}
      </div>
      <div className="sugerencias-container">
        {/* Opcional: Manejar sugerencias */}
      </div>
    </div>
  );
};

export default AgregarNuevaPieza;
