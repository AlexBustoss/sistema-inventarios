import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RequisitionScreen.css";
import Header from "../components/Dashboard/Header";

const EditRequisitionScreen = () => {
  const { id } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate();
  
  // Estado para los datos de la requisición
  const [formData, setFormData] = useState({
    project: "",
    date: "",
    requisitionNumber: "",
    department: "",
    responsible: "",
    position: "",
    address: "",
    colony: "",
    city: "",
    phone: "",
    projectNumber: "",
    observations: "",
    items: [],
  });

  // Cargar la información de la requisición al montar la página
  useEffect(() => {
    const fetchRequisition = async () => {
      try {
        // 1️⃣ Obtener los datos generales de la requisición
        const response = await axios.get(`/api/requisiciones/${id}`);
        const requisitionData = response.data;

        // 2️⃣ Obtener los detalles de las piezas de la requisición
        const detailsResponse = await axios.get(`/api/requisiciones/detalle/${id}`);
        const detailsData = detailsResponse.data;

        // 3️⃣ Actualizar el estado con los datos obtenidos
        setFormData({
          project: requisitionData.Destino,
          date: requisitionData.Fecha.split("T")[0], // Eliminar la hora
          requisitionNumber: requisitionData.No_Requisicion,
          department: requisitionData.Departamento,
          responsible: requisitionData.Nombre_Solicitante,
          position: requisitionData.Puesto_Solicitante,
          address: requisitionData.Calle_Numero,
          colony: requisitionData.Colonia,
          city: requisitionData.Ciudad,
          phone: requisitionData.Telefono,
          projectNumber: requisitionData.id_proyecto,
          observations: requisitionData.Notas,
          items: detailsData.map((item) => ({
            ID_Pieza: item.ID_Pieza,
            ID_Unidad: item.ID_Unidad,
            Cantidad_Solicitada: item.Cantidad_Solicitada,
            Marca: item.Marca,
            Descripcion: item.Descripcion,
            Cantidad_Entregada: item.Cantidad_Entregada || "",
            Fecha_Entrega: item.Fecha_Entrega ? item.Fecha_Entrega.split("T")[0] : "",
          })),
        });
      } catch (error) {
        console.error("❌ Error al cargar la requisición:", error);
      }
    };

    fetchRequisition();
  }, [id]);

  // Manejo de cambios en los inputs
  const handleChange = (e, section, index, field) => {
    const { name, value } = e.target;

    if (section === "items") {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = value;
        setFormData((prevData) => ({ ...prevData, items: updatedItems }));
    } else {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
};


  // Guardar cambios
const handleSave = async () => {
  const updatedData = {
    Fecha: formData.date || new Date().toISOString().split("T")[0],
    Departamento: formData.department || "No especificado",
    Destino: formData.project || "No especificado",
    Notas: formData.observations || "",
    Fecha_Entrega: null,
    Nombre_Solicitante: formData.responsible || "No especificado",
    Puesto_Solicitante: formData.position || "No especificado",
    Calle_Numero: formData.address || "",
    Colonia: formData.colony || "",
    Ciudad: formData.city || "",
    Estado: "Chihuahua",
    Telefono: formData.phone || "0000000000",
    estado: "Pendiente",
    ID_Estado: 1, 
  };

  const formattedItems = formData.items.map((item) => ({
    ID_Pieza: item.ID_Pieza ? parseInt(item.ID_Pieza, 10) : null,
    ID_Unidad: item.ID_Unidad ? parseInt(item.ID_Unidad, 10) : null,
    Cantidad_Solicitada: item.Cantidad_Solicitada ? parseInt(item.Cantidad_Solicitada, 10) : 0,
    Cantidad_Entregada: item.Cantidad_Entregada ? parseInt(item.Cantidad_Entregada, 10) : 0,
    Fecha_Entrega: item.Fecha_Entrega || null,
  }));

  try {
    // 1️⃣ Actualizar la requisición
    await axios.put(`http://localhost:3000/api/requisiciones/${id}`, updatedData);

    // 2️⃣ Actualizar cada pieza de la requisición en `detalle_requisiciones`
    for (const item of formData.items) {
      await axios.put(`http://localhost:3000/api/requisiciones/detalle/${id}/${item.ID_Pieza}`, item);
    }
    

    alert("✅ Requisición y piezas actualizadas exitosamente.");
    navigate("/home-requisiciones");
  } catch (error) {
    console.error("❌ Error al actualizar la requisición:", error.response?.data || error);
    alert("⚠ Error al actualizar la requisición. Revisa la consola.");
  }
};

  


  return (
    <div className="requisition-container">
      <Header title="Editar Requisición" showBackButton={true} backPath="/home-requisiciones" />

      {/* Formulario de edición */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Datos de la Requisición</h2>
        <div className="requisition-grid">
          {[
            { label: "Proyecto / Obra destino", key: "project" },
            { label: "Fecha", key: "date", type: "date" },
            { label: "No. Requisición", key: "requisitionNumber" },
            { label: "Área / Departamento", key: "department" },
            { label: "Puesto", key: "position" },
            { label: "Nombre del responsable", key: "responsible" },
            { label: "Calle y Número", key: "address" },
            { label: "Colonia", key: "colony" },
            { label: "Ciudad, Edo., y C.P.", key: "city" },
            { label: "Teléfono y/o Extensión", key: "phone" }
          ].map((field, index) => (
            <div className="requisition-grid-item" key={index}>
              <strong>{field.label}</strong>
              <input
                type={field.type || "text"}
                name={field.key}
                value={formData[field.key] || ""}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tabla de piezas */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Piezas de la Requisición</h2>
        <table className="requisition-table">
          <thead>
            <tr>
              <th>Cant. Solicitada</th>
              <th>Unidad</th>
              <th>Marca</th>
              <th>Descripción</th>
              <th>Cant. Entregada</th>
              <th>Fecha de entrega</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={item.Cantidad_Solicitada}
                    onChange={(e) => handleChange(e, "items", index, "Cantidad_Solicitada")}
                  />
                </td>
                <td>{item.ID_Unidad}</td>
                <td>{item.Marca}</td>
                <td>{item.Descripcion}</td>
                <td>
                  <input
                    type="number"
                    value={item.Cantidad_Entregada}
                    onChange={(e) => handleChange(e, "items", index, "Cantidad_Entregada")}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={item.Fecha_Entrega}
                    onChange={(e) => handleChange(e, "items", index, "Fecha_Entrega")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Botones de acción */}
      <div className="requisition-buttons">
        <button className="requisition-cancel-button" onClick={() => navigate("/home-requisiciones")}>
          Cancelar
        </button>
        <button className="requisition-save-button" onClick={handleSave}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditRequisitionScreen;
