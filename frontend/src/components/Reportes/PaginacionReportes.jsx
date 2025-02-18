import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Iconos para los botones
import "../../styles/PaginacionReportes.css"; // ✅ Importamos los estilos

const PaginacionReportes = ({ paginaActual, setPaginaActual, totalPaginas }) => {
  return (
    <div className="paginacion-container">
      <button
        className="boton-paginacion"
        disabled={paginaActual === 1}
        onClick={() => setPaginaActual(paginaActual - 1)}
      >
        <ChevronLeft className="icono-paginacion" /> Anterior
      </button>
      <span className="pagina-actual">Página {paginaActual} de {totalPaginas}</span>
      <button
        className="boton-paginacion"
        disabled={paginaActual === totalPaginas}
        onClick={() => setPaginaActual(paginaActual + 1)}
      >
        Siguiente <ChevronRight className="icono-paginacion" />
      </button>
    </div>
  );
};

export default PaginacionReportes;
