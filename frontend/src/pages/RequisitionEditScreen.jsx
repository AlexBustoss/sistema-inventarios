import React from "react";
import "../styles/RequisitionScreen.css";

const EditRequisitionScreen = () => {
  return (
    <div className="requisition-container">
      <button
        className="dashboard-back-button"
        onClick={() => (window.location.href = "/home-requisiciones")}
      >
        Regresar a gestion requisicion
      </button>
      {/* Encabezado */}
      <header className="requisition-header">
        <img
          src="/assets/images/CODETEC.png"
          alt="Codetec Logo"
          className="requisition-logo"
        />
        <h1 className="requisition-title">Editar Requisición</h1>
        <div className="requisition-buttons">
          <button className="requisition-cancel-button">Cancelar</button>
          <button className="requisition-save-button">Guardar Cambios</button>
        </div>
      </header>

      {/* Datos de la requisición */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Datos de la requisición y destino</h2>
        <div className="requisition-grid">
          <div className="requisition-grid-item">
            <strong>Proyecto / Obra destino</strong>
            <p>Organizador Escritorio</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Fecha</strong>
            <p>03 diciembre 2024</p>
          </div>
          <div className="requisition-grid-item">
            <strong>No. Requisición</strong>
            <p>MBGR 071 2024</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Área / Departamento</strong>
            <p>—</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Nombre del responsable</strong>
            <p>Juan Pérez</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Puesto</strong>
            <p>ING. de proyectos eléctricos</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Calle y Número</strong>
            <p>—</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Colonia</strong>
            <p>—</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Ciudad, Edo., y C.P.</strong>
            <p>Chihuahua, Chih.</p>
          </div>
          <div className="requisition-grid-item">
            <strong>Teléfono y/o Extensión</strong>
            <p>(614) 456 78 91</p>
          </div>
        </div>
      </section>

      {/* Tabla de proyectos */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">No. Proyecto</h2>
        <p className="requisition-project-number">123456789</p>
        <table className="requisition-table">
          <thead>
            <tr>
              <th>Cant. Solicitada</th>
              <th>U.M.</th>
              <th>Marca</th>
              <th>No. Parte</th>
              <th>Nombre y descripción</th>
              <th>Cant. Entregada</th>
              <th>Fecha de entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>PZA</td>
              <td>Marca 1</td>
              <td>0345</td>
              <td>Organizador de carpetas horizontal</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>50</td>
              <td>PZA</td>
              <td>Marca 2</td>
              <td>0335</td>
              <td>Folder tamaño carta</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>10</td>
              <td>Caja</td>
              <td>Marca 3</td>
              <td>0456</td>
              <td>Grapadora metálica</td>
              <td>2</td>
              <td>2024-12-10</td>
            </tr>
            <tr>
              <td>15</td>
              <td>PZA</td>
              <td>Marca 4</td>
              <td>0678</td>
              <td>Carpeta tamaño oficio</td>
              <td>10</td>
              <td>2024-12-12</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Juego</td>
              <td>Marca 5</td>
              <td>0987</td>
              <td>Juego de destornilladores</td>
              <td>3</td>
              <td>2024-12-15</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Observaciones */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Observaciones / Notas</h2>
        <textarea
          className="requisition-textarea"
          placeholder="Material necesario para..."
        ></textarea>
      </section>

      {/* Estado de las piezas */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Estado de las Piezas del Proyecto</h2>
        <div className="requisition-pieces-status">
          <div className="requisition-pieces-column">
            <h3>Piezas Faltantes</h3>
            <p>Organizador de carpetas horizontal</p>
            <p>Carpeta tamaño oficio</p>
          </div>
          <div className="requisition-pieces-column">
            <h3>Piezas Asignadas</h3>
            <p>Grapadora metálica</p>
            <p>Juego de destornilladores</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditRequisitionScreen;
