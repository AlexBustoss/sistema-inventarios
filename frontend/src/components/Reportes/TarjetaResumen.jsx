import React from "react";

const TarjetaResumen = ({ titulo, valor, icono }) => {
  return (
    <div className="tarjeta-resumen">
      <span className="icono">{icono}</span>
      <div className="info">
        <h4>{titulo}</h4>
        <p>{valor}</p>
      </div>
    </div>
  );
};

export default TarjetaResumen;
