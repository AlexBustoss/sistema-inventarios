// 📌 src/components/UI/Dialog.jsx
import React from "react";

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        {children}
        <button className="close-button" onClick={onClose}>
          ✖ Cerrar
        </button>
      </div>
    </div>
  );
};

export const DialogTitle = ({ children }) => <h2 className="dialog-title">{children}</h2>;
export const DialogContent = ({ children }) => <div className="dialog-body">{children}</div>;
export const DialogFooter = ({ children }) => <div className="dialog-footer">{children}</div>;

export default Dialog;
