const RequisicionesService = require('../services/requisiciones.service');

const aceptarRequisicion = async (id) => {
    try {
        // Llamar al servicio para aceptar la requisición
        const resultado = await RequisicionesService.aceptarRequisicion(id);
        return resultado;
    } catch (error) {
        throw error; // Propagar el error para manejo global
    }
};

module.exports = {
    aceptarRequisicion,
};
