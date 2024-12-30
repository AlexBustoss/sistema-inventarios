import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/PiezasPage.css";
import PiezasTable from "../components/PiezasPage/PiezasTable";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import { getAllPiezas } from "../services/piezasService";

const PiezasPage = () => {
  const [piezas, setPiezas] = useState([]);

  useEffect(() => {
    document.body.classList.add("piezas");
    return () => {
      document.body.classList.remove("piezas");
    };
  }, []);

  useEffect(() => {
    const fetchPiezas = async () => {
      try {
        const data = await getAllPiezas();
        setPiezas(data);
      } catch (error) {
        console.error("Error al cargar las piezas:", error);
      }
    };

    fetchPiezas();
  }, []);

  return (
    <div>
      {/* Botón para regresar al Dashboard */}
      <button
        className="dashboard-back-button"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Regresar al Dashboard
      </button>

      {/* Header */}
      <Header title="Gestión de Piezas" />

      <div className="piezas-page">
        {/* Tabla de piezas */}
        <PiezasTable piezas={piezas} setPiezas={setPiezas} />

        {/* Botones debajo de la tabla */}
        <NavigationButtons
          buttons={[
            {
              id: 1,
              text: "Importar Piezas",
              onClick: () => (window.location.href = "/importar-piezas"), // Navegación al ImportarPiezasPage
            },
          ]}
        />
      </div>
    </div>
  );
};

export default PiezasPage;
