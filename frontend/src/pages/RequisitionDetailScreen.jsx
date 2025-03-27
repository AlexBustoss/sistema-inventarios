import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/RequisitionDetailScreen.css";
import Header from "../components/Dashboard/Header";

const RequisitionDetailScreen = () => {
  const { id } = useParams();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [entregaData, setEntregaData] = useState({
    cantidad: "",
    fecha: "",
  });

  useEffect(() => {
    const fetchRequisition = async () => {
        try {
          const response = await axios.get(`/api/requisiciones/${id}`);
          const requisitionData = response.data;
      
          // Nueva petición: obtener detalles de piezas
          const detallesResponse = await axios.get(`/api/requisiciones/detalle/${id}`);
          const detalles = detallesResponse.data;
      
          // Agregar items a la requisición
          requisitionData.items = detalles;
          setRequisition(requisitionData);
      
      } catch (error) {
        console.error("❌ Error al cargar la requisición:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequisition();
  }, [id]);

  const openEntregaModal = (item) => {
    setSelectedItem(item);
    setEntregaData({ cantidad: "", fecha: "" });
    setShowModal(true);
  };

  const confirmarEntrega = async () => {
    try {
      const { cantidad, fecha } = entregaData;
  
      await axios.put(
        `/api/detalle_requisiciones/entregar/${requisition.ID_Requisicion}/${selectedItem.ID_Pieza}`,
        {
          cantidadEntregadaNueva: parseInt(cantidad, 10),
          fechaEntrega: fecha,
        }
      );
  
      // ✅ Volver a cargar piezas actualizadas (no solo la cabecera)
      const detallesResponse = await axios.get(`/api/requisiciones/detalle/${id}`);
      
      setRequisition((prev) => ({
        ...prev,
        items: detallesResponse.data,
      }));
      
      // Verificar si ya se completó todo y actualizar estado
      try {
        const verificar = await axios.put(`/api/requisiciones/${requisition.ID_Requisicion}/completar-si-entregada`);
        if (verificar.data.completada) {
          setRequisition((prev) => ({
            ...prev,
            estado: "Completada",
          }));
        }
      } catch (err) {
        console.error("⚠️ Error al verificar completitud:", err);
      }
      
  
      setToastMessage("✅ Entrega registrada correctamente");
      setShowModal(false);
  
      // Ocultar el toast después de 3 segundos
      setTimeout(() => setToastMessage(""), 3000);
  
    } catch (error) {
      console.error("❌ Error al entregar pieza:", error);
      alert("Error al registrar la entrega. Revisa la consola.");
    }
  };

  // Progreso total de la requisición
const calcularProgresoTotal = () => {
    const total = requisition.items.reduce((acc, item) => acc + item.Cantidad_Solicitada, 0);
    const entregado = requisition.items.reduce((acc, item) => acc + (item.Cantidad_Entregada || 0), 0);
    return total === 0 ? 0 : Math.round((entregado / total) * 100);
  };
  
  // Progreso individual por pieza
  const calcularProgresoPieza = (item) => {
    const entregado = item.Cantidad_Entregada || 0;
    const total = item.Cantidad_Solicitada;
    return total === 0 ? 0 : Math.round((entregado / total) * 100);
  };
  
  

  if (loading) return <p>Cargando...</p>;
  if (!requisition) return <p>No se encontró la requisición.</p>;

  return (
    <div className="requisition-detail-container">
    {toastMessage && <div className="toast">{toastMessage}</div>}

      <Header title={`Detalle de Requisición #${requisition.ID_Requisicion}`} showBackButton={true} backPath="/home-requisiciones" />

      <section className="requisition-section info-general-grid">
        <h2 className="section-title">Información General</h2>
        <div className="info-grid">
            <div><span className="label">Proyecto:</span> {requisition.Destino}</div>
            <div><span className="label">Departamento:</span> {requisition.Departamento}</div>
            <div><span className="label">Responsable:</span> {requisition.Nombre_Solicitante}</div>
            <div><span className="label">Fecha:</span> {new Date(requisition.Fecha).toLocaleDateString()}</div>
        </div>
        </section>


      <section className="requisition-section">
      <div className="section-title-with-progress">
  <h2>Piezas de la Requisición</h2>
  <div className="progress-circle">
    <svg viewBox="0 0 36 36" className="circular-chart">
      <path
        className="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle"
        strokeDasharray={`${calcularProgresoTotal()}, 100`}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" className="percentage">
        {calcularProgresoTotal()}%
      </text>
    </svg>
  </div>
</div>

        <table className="requisition-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Marca</th>
              <th>Cantidad Solicitada</th>
              <th>Cantidad Entregada</th>
              <th>Fecha de Entrega</th>
              <th>Acciones</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {requisition.items && requisition.items.map((item, index) => (

              <tr key={index}>
                <td>{item.Descripcion}</td>
                <td>{item.Marca}</td>
                <td>{item.Cantidad_Solicitada}</td>
                <td>{item.Cantidad_Entregada ?? 0}</td>
                <td>{item.Fecha_Entrega ? new Date(item.Fecha_Entrega).toLocaleDateString() : "-"}</td>
                <td>
                <button className="entregar-button" onClick={() => openEntregaModal(item)}>Entregar</button>
                </td>
                <td>
                <div className="progress-bar-container">
                    <div
                    className="progress-bar"
                    style={{ width: `${calcularProgresoPieza(item)}%` }}
                    ></div>
                </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar Entrega</h3>
            <label>
              Cantidad entregada:
              <input
                type="number"
                value={entregaData.cantidad}
                onChange={(e) => setEntregaData({ ...entregaData, cantidad: e.target.value })}
              />
            </label>
            <label>
              Fecha de entrega:
              <input
                type="date"
                value={entregaData.fecha}
                onChange={(e) => setEntregaData({ ...entregaData, fecha: e.target.value })}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={confirmarEntrega}>Confirmar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionDetailScreen;
