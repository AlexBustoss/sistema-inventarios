import React from "react";
import "../../styles/NavigationButtons.css";

const NavigationButtons = ({ buttons }) => {
  return (
    <div className="navigation-buttons-container">
      {buttons.map((button) => (
        <button
          key={button.id}
          className="navigation-button"
          onClick={button.onClick}
        >
          <span className="button-icon">{button.icon}</span> {/* Icono dinámico */}
          <span className="button-text">{button.text}</span> {/* Texto dinámico */}
        </button>
      ))}
    </div>
  );
};

export default NavigationButtons;
