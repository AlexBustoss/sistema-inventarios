import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RequisitionScreen.css";



const RequisitionScreen = () => {
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState([]); // Lista de unidades para el dropdown
  const [sugerenciasPorFila, setSugerenciasPorFila] = useState({});

  const fetchUnidades = async () => {
    try {
      const resp = await axios.get("/api/unidades_medida");
      setUnidades(resp.data);  // Guarda { ID_Unidad, Nombre }
    } catch (err) {
      console.error("Error al obtener unidades:", err);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);
  
  
  
  const handleSearchPiezas = async (index, texto) => {
    if (!texto) {
      setSugerenciasPorFila((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    try {
      const resp = await axios.get(`/api/piezas/similares?q=${encodeURIComponent(texto)}`);
      setSugerenciasPorFila((prev) => ({ ...prev, [index]: resp.data }));
    } catch (err) {
      console.error("Error al buscar piezas:", err);
    }
  };
  

  const handleSelectPieza = (index, pieza) => {
    const updated = [...formData.items];
    updated[index].ID_Pieza = pieza.ID_Pieza;
    updated[index].Marca = pieza.Marca;
    updated[index].Descripcion = pieza.Descripcion;
  
    setFormData({ ...formData, items: updated });
  
    //Borra las sugerencias solo de la fila seleccionada
    setSugerenciasPorFila((prev) => ({ ...prev, [index]: [] }));
  
    console.log("🔍 Pieza seleccionada en índice", index, ":", updated[index]);
  };
  
  
   
  


  // Estado para manejar los valores del formulario
  const [formData, setFormData] = useState({
    // Campos principales
    project: "",            // "Proyecto / Obra destino"
    date: "",               // "Fecha"
    requisitionNumber: "",  // "No. Requisición"
    department: "",         // "Área / Departamento"
    responsible: "",        // "Nombre del responsable" (en BD => Nombre_Solicitante)
    position: "",           // "Puesto" (en BD => puesto)
    address: "",            // "Calle y Número" (en BD => Calle_Numero)
    colony: "",             // "Colonia"
    city: "",               // "Ciudad, Edo., y C.P."
    phone: "",              // "Teléfono y/o Extensión" (podrías descomponer si tienes 2 campos en BD)
    projectNumber: "",      // "No. Proyecto" => lo usarás en BD como id_proyecto si quieres
    observations: "",       // "Observaciones / Notas"

    // Filas de items
    items: [
      {
        ID_Pieza: null,         // Aquí se guardará el ID de la pieza seleccionada
        ID_Unidad: null,        // Aquí se guardará el ID de la unidad seleccionada
        Cantidad_Solicitada: "1", // Para capturar la cantidad que solicita el usuario
        Marca: "",              // Solo para mostrar en la UI
        Descripcion: "",        // Solo para mostrar en la UI
        Cantidad_Entregada: "",          // Cantidad entregada (si se usa)
        Fecha_Entrega: ""        // Fecha de entrega (si se usa)
      }
    ],
    
    
    // Ejemplo de "Autorización"
    authorization: [
      { signature: "", name: "", position: "" },
    ]
  });

  // Manejar cambios en los inputs
  const handleChange = (e, section, index, field) => {
    const { name, value } = e.target;
  
    if (section === "items") {
      const updatedItems = [...formData.items];
      updatedItems[index][field] = value;
      setFormData({ ...formData, items: updatedItems });
      console.log(`📝 Cambió el campo "${field}" en la fila ${index}:`, value);
    } else if (section === "authorization") {
      const updatedAuth = [...formData.authorization];
      updatedAuth[index][field] = value;
      setFormData({ ...formData, authorization: updatedAuth });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      console.log(`📝 Cambió el campo "${name}" en datos generales:`, value);
    }
  };
  
  // Manejar el click del botón "Mandar Requisición"
  const handleSubmit = async () => {
    try {
      // 1) Crear la requisición (cabecera) en /api/requisiciones
      const bodyRequisicion = {
        No_Requisicion: formData.requisitionNumber,
        Fecha: formData.date,
        Destino: formData.project, 
        Nombre_Solicitante: formData.responsible,
        Departamento: formData.department, 
        Puesto_Solicitante: formData.position,
        Calle_Numero: formData.address,
        Colonia: formData.colony,
        Ciudad: formData.city,
        Telefono: formData.phone,
        Notas: formData.observations,
        id_proyecto: parseInt(formData.projectNumber, 10) || 1,
        estado: "Pendiente"
      };
      
      const resp = await axios.post("/api/requisiciones", bodyRequisicion);
      const newReqId = resp.data.ID_Requisicion;
      console.log("📤 Requisición creada:", resp.data);
  
      // 2) Insertar cada item en /api/detalleRequisiciones
      console.log("📤 Enviando los siguientes items:", formData.items);
  
      for (const item of formData.items) {
        const bodyDetalle = {
          ID_Requisicion: newReqId,
          ID_Pieza: parseInt(item.ID_Pieza, 10),
          ID_Unidad: parseInt(item.ID_Unidad, 10),
          Cantidad_Solicitada: parseInt(item.Cantidad_Solicitada, 10) || 0,
          id_proyecto: parseInt(formData.projectNumber, 10) || null,
          Marca: item.Marca && item.Marca.trim() !== "" ? item.Marca : "SIN MARCA",
          No_Parte: item.No_Parte && item.No_Parte.trim() !== "" ? item.No_Parte : "SIN NÚMERO DE PARTE",
          Descripcion: item.Descripcion && item.Descripcion.trim() !== "" ? item.Descripcion : "SIN DESCRIPCIÓN",
          Cantidad_Entregada: parseInt(item.Cantidad_Entregada, 10) || 0,
          Fecha_Entrega: item.Fecha_Entrega && item.Fecha_Entrega.trim() !== "" ? item.Fecha_Entrega : null
        };
  
        console.log("📦 Datos enviados al backend:", bodyDetalle);
  
        const respDetalle = await axios.post("/api/detalle_requisiciones", bodyDetalle);
        console.log("✅ Detalle creado:", respDetalle.data);
      }
  
      alert("Requisición creada exitosamente.");
      navigate("/home-requisiciones");
    } catch (error) {
      console.error("❌ Error al crear la requisición:", error);
      alert("Ocurrió un error al crear la requisición. Revisa la consola.");
    }
  };
  

  // Agrega una nueva fila vacía en formData.items
const handleAddItem = () => {
  const newItem = {
    ID_Pieza: null,
    ID_Unidad: null,
    Cantidad_Solicitada: "",
    Marca: "",
    Descripcion: "",
    Cantidad_Entregada: "",
    Fecha_Entrega: ""
  };
  setFormData((prevForm) => ({
    ...prevForm,
    items: [...prevForm.items, newItem]
  }));
};

// Elimina la fila en el índice "index"
const handleRemoveItem = (index) => {
  setFormData((prevForm) => {
    const updatedItems = [...prevForm.items];
    updatedItems.splice(index, 1);
    return { ...prevForm, items: updatedItems };
  });
};

  return (
    <div className="requisition-container">
      <button
        className="dashboard-back-button"
        onClick={() => navigate("/home-requisiciones")}
      >
        Regresar a gestión requisición
      </button>

      <header className="requisition-header">
        <img
          src="/assets/images/CODETEC.png"
          alt="Codetec Logo"
          className="requisition-logo"
        />
        <h1 className="requisition-title">Agregar Requisición</h1>
        <button className="requisition-send-button" onClick={handleSubmit}>
          Mandar Requisición
        </button>
      </header>

      {/* Datos de la requisición */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Datos de la requisición y destino</h2>
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
                className="requisition-input"
                name={field.key}
                value={formData[field.key]}
                onChange={handleChange}
                placeholder={field.label}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tabla de proyecto */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">No. Proyecto</h2>
        <input
          type="text"
          className="requisition-input project-number-input"
          name="projectNumber"
          value={formData.projectNumber}
          onChange={handleChange}
          placeholder="Número de Proyecto"
        />
        
        <table className="requisition-table">
  <thead>
    <tr>
      <th>Cant. Solicitada</th>
      <th>U.M.</th>
      <th>Buscar Pieza</th>
      <th>Pieza Seleccionada</th>
      <th>Cant. Entregada</th>
      <th>Fecha de entrega</th>
      <th>Acciones</th>

    </tr>
  </thead>
  <tbody>
    {formData.items.map((item, index) => (
      <tr key={index}>
        {/* Cantidad Solicitada */}
        <td>
          <input
            type="number"
            className="requisition-input"
            value={item.Cantidad_Solicitada || ""}
            onChange={(e) => handleChange(e, "items", index, "Cantidad_Solicitada")}
            placeholder="Cantidad"
          /> 
        </td>

        {/* Unidad de Medida - Dropdown */}
        <td>
        <select
        className="requisition-input custom-dropdown"
        value={item.ID_Unidad || ""}
        onChange={(e) => handleChange(e, "items", index, "ID_Unidad")}
      >
        <option value="">Selecciona unidad...</option>
        {unidades.map((u) => (
          <option key={u.ID_Unidad} value={u.ID_Unidad}>
            {u.Nombre}
          </option>
        ))}
      </select>

        </td>

        

        {/* Input de búsqueda de pieza */}
        {/* Buscar Pieza => <input> con sugerencias */}
        <td>
          <input
            type="text"
            className="requisition-input"
            placeholder="Buscar pieza por marca/descr..."
            onChange={(e) => handleSearchPiezas(index, e.target.value)}
            />
          {sugerenciasPorFila[index] && sugerenciasPorFila[index].length > 0 && (
          <ul className="suggestions">
            {sugerenciasPorFila[index].map((pz) => (
              <li key={pz.ID_Pieza} onClick={() => handleSelectPieza(index, pz)}>
                {pz.Marca} - {pz.Descripcion}
              </li>
            ))}
          </ul>
        )}

        </td>

        {/* Mostrar pieza seleccionada */}
        <td>
          {item.ID_Pieza ? (
            <p>
              {item.ID_Pieza} - {item.Marca} ({item.Descripcion})
            </p>
          ) : (
            <p>No seleccionada</p>
          )}
        </td>

        {/* Cantidad Entregada */}
        <td>
          <input
            type="number"
            className="requisition-input"
            value={item.Cantidad_Entregada || ""}
            onChange={(e) => handleChange(e, "items", index, "Cantidad_Entregada")}
            placeholder="Cantidad Entregada"
          />
        </td>

        {/* Fecha de Entrega */}
        <td>
          <input
            type="date"
            className="requisition-input"
            value={item.Fecha_Entrega || ""}
            onChange={(e) => handleChange(e, "items", index, "Fecha_Entrega")}
          />
        </td>

        {/* Botón eliminar */}
      <td>
        <button 
          className="remove-item-button" 
          onClick={() => handleRemoveItem(index)}
        >
          Eliminar
        </button>
      </td>
      </tr>
    ))}
  </tbody>
</table>
<button className="add-item-button" onClick={handleAddItem}>
  Agregar otra pieza
</button>


      </section>

      {/* Observaciones */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Observaciones / Notas</h2>
        <textarea
          className="requisition-textarea"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder="Material necesario para..."
        />
      </section>

      {/* Autorizaciones */}
      <section className="requisition-section">
        <h2 className="requisition-section-title">Autorización</h2>
        <table className="requisition-table">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Autorización</th>
              <th>Aprobación</th>
            </tr>
          </thead>
          <tbody>
            {formData.authorization.map((auth, index) => (
              <tr key={index}>
                {Object.keys(auth).map((field, i) => (
                  <td key={i}>
                    <input
                      type="text"
                      className="requisition-input"
                      value={auth[field]}
                      onChange={(e) => handleChange(e, "authorization", index, field)}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default RequisitionScreen;
