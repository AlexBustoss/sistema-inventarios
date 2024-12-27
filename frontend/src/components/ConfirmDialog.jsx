import React from "react";
import "../styles/ConfirmDialog.css";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  const handleOverlayClick = (e) => {
    if (e.target.className === "confirm-dialog-overlay") {
      onCancel(); // Llama a la función cancelar si se hace clic fuera del diálogo
    }
  };

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={handleOverlayClick} // Detecta clics fuera del cuadro
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <p id="confirm-dialog-description">{message}</p>
        <div className="confirm-dialog-buttons">
          <button
            className="confirm-button"
            onClick={onConfirm}
            aria-label="Confirmar acción"
          >
            Confirmar
          </button>
          <button
            className="cancel-button"
            onClick={onCancel}
            aria-label="Cancelar acción"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
