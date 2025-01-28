// requisiciones.controller.js

const RequisicionesService = require('../services/requisiciones.service');

const aceptarRequisicion = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await RequisicionesService.aceptarRequisicion(id);
        res.status(200).json({ message: 'Requisición aceptada con éxito', resultado });
    } catch (error) {
        console.error("❌ Error al aceptar requisición:", error);
        res.status(400).json({ error: error.message });
    }
};

const cancelarRequisicion = async (req, res) => {
  console.log("📌 ID recibido en req.params en controlador:", req.params);  // Depuración
  const { id } = req.params;  // Extrae id de req.params

  if (!id) {
      return res.status(400).json({ error: "ID de requisición no proporcionado en la URL." });
  }

  try {
      const resultado = await RequisicionesService.cancelarRequisicion(id);
      res.status(200).json({ message: 'Requisición cancelada con éxito', resultado });
  } catch (error) {
      console.error("❌ Error al cancelar requisición:", error);
      res.status(400).json({ error: error.message });
  }
};

module.exports = {
    aceptarRequisicion,
    cancelarRequisicion,
};
