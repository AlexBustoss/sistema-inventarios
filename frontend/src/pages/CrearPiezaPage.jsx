import React, { useState } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/CrearPiezaPage.css"; // Importa los estilos específicos
import { addNewCatalogPieza } from "../services/piezasService"; // Ajusta según tu servicio real

const CrearPiezaPage = () => {
  const [descripcion, setDescripcion] = useState("");
  const [marca, setMarca] = useState("");
  const [mensaje, setMensaje] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!descripcion.trim() || !marca.trim()) {
      setMensaje("Por favor, llena Descripción y Marca");
      return;
    }

    try {
      // Llamar a tu servicio, asumiendo que "addNewCatalogPieza" hace POST /api/piezas
      const nuevaPieza = await addNewCatalogPieza({ descripcion, marca });
      
      // Se guardó con éxito
      setMensaje(`Pieza creada con ID: ${nuevaPieza.ID_Pieza}`);
      // Limpiar campos
      setDescripcion("");
      setMarca("");
    } catch (error) {
      console.error("Error al crear la pieza:", error);
      setMensaje("Ocurrió un error al crear la pieza");
    }
  };

  return (
    <div className="crear-pieza-page">
      

      <Header title="Crear Nueva Pieza" />

      {/* Botón para regresar a la lista de piezas */}
      <button
        className="back-button"
        onClick={() => (window.location.href = "/piezas")}
      >
        Regresar a Piezas
      </button>

      <div className="crear-pieza-card">
        <h2 className="crear-pieza-title">Datos de la Nueva Pieza</h2>
        
        <form className="crear-pieza-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="descripcion">Descripción</label>
            <input
              id="descripcion"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Tornillo 1/4 cabeza hex"
            />
          </div>

          <div className="input-group">
            <label htmlFor="marca">Marca</label>
            <input
              id="marca"
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej. ACME"
            />
          </div>

          <button type="submit" className="crear-pieza-submit">
            Guardar
          </button>
        </form>

        {mensaje && <p className="crear-pieza-mensaje">{mensaje}</p>}
      </div>
    </div>
  );
};

export default CrearPiezaPage;
