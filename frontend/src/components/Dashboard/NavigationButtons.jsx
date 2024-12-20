import React from "react";
import "../../styles/NavigationButtons.css";
import { FiSettings, FiPackage, FiFileText, FiBarChart2 } from "react-icons/fi"; // Íconos de react-icons


const NavigationButtons = () => {
  const buttons = [
    {
      id: 1,
      text: "Gestión de Piezas",
      icon: <FiSettings />,
      onClick: () => console.log("Gestión de Piezas"),
    },
    {
      id: 2,
      text: "Gestión de Proveedores",
      icon: <FiPackage />,
      onClick: () => console.log("Gestión de Proveedores"),
    },
    {
      id: 3,
      text: "Gestión de Requisiciones",
      icon: <FiFileText />,
      onClick: () => console.log("Gestión de Requisiciones"),
    },
    {
      id: 4,
      text: "Reportes",
      icon: <FiBarChart2 />,
      onClick: () => console.log("Reportes"),
    },
  ];

  return (
    <div className="navigation-buttons-container">
      {buttons.map((button) => (
        <button
          key={button.id}
          className="navigation-button"
          onClick={button.onClick}
        >
          <span className="button-icon">{button.icon}</span>
          <span className="button-text">{button.text}</span>
        </button>
      ))}
    </div>
  );
};

export default NavigationButtons;
