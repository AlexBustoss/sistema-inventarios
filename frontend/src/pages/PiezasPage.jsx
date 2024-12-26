import React, { useEffect, useState } from "react";
import Header from "../components/Dashboard/Header";
import "../styles/PiezasPage.css";
import PiezasTable from "../components/PiezasPage/PiezasTable"; // Importamos la tabla
import NavigationButtons from "../components/Dashboard/NavigationButtons"; // Asegúrate de que el path sea correcto
import { getAllPiezas } from "../services/piezasService"; // Importamos el servicio para obtener piezas

const PiezasPage = () => {
  const [piezas, setPiezas] = useState([]); // Estado para almacenar las piezas

  useEffect(() => {
    document.body.classList.add("piezas");
    return () => {
      document.body.classList.remove("piezas");
    };
  }, []);

  useEffect(() => {
    // Cargar piezas desde el backend
    const fetchPiezas = async () => {
      try {
        const data = await getAllPiezas(); // Llamamos al servicio
        setPiezas(data); // Actualizamos el estado con las piezas obtenidas
      } catch (error) {
        console.error("Error al cargar las piezas:", error);
      }
    };

    fetchPiezas(); // Llamamos a la función para cargar las piezas
  }, []);

  return (
    <div>
      {/* Header */}
      <Header title="Gestión de Piezas" /> {/* Corrección de sintaxis */}
      <div className="piezas-page">
          {/* Tabla de piezas */}
          <PiezasTable piezas={piezas} /> {/* Pasamos las piezas como props */}
          {/* Botones debajo de la tabla */}
          <NavigationButtons
            buttons={[
              { id: 1, text: "Agregar Nueva Pieza", onClick: () => console.log("Agregar Nueva Pieza") },
              { id: 2, text: "Importar Piezas", onClick: () => console.log("Importar Piezas") },
            ]}
          />
        </div>
      </div>
  );
};

export default PiezasPage;
