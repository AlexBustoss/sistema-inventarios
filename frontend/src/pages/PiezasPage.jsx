import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/PiezasPage.css";
import PiezasTable from "../components/PiezasPage/PiezasTable";
import NavigationButtons from "../components/Dashboard/NavigationButtons";
import { getPiezasWithStock } from "../services/piezasService";

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
        const data = await getPiezasWithStock();
        setPiezas(data);
      } catch (error) {
        console.error("Error al cargar las piezas:", error);
      }
    };

    fetchPiezas();
  }, []);

  return (
    <div>
      {/* Header con botón de regreso dinámico */}
      <Header title="Gestión de Piezas" showBackButton={true} backPath="/dashboard" />

      <div className="piezas-page main-content">
        {/* Tabla de piezas */}
        <PiezasTable piezas={piezas} setPiezas={setPiezas} />

        {/* Botones debajo de la tabla */}
        <NavigationButtons
          buttons={[
            {
              id: 1,
              text: "Nueva Pieza",
              onClick: () => (window.location.href = "/nueva-pieza"),
            },
            {
              id: 2,
              text: "Importar Piezas",
              onClick: () => (window.location.href = "/importar-piezas"),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default PiezasPage;
