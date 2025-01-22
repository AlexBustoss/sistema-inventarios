// requisiciones.controller.js

const RequisicionesService = require('../services/requisiciones.service');

const aceptarRequisicion = async (id) => {
  try {
    const resultado = await RequisicionesService.aceptarRequisicion(id);
    return resultado;
  } catch (error) {
    throw error;
  }
};

const cancelarRequisicion = async (id) => {
  try {
    const resultado = await RequisicionesService.cancelarRequisicion(id);
    return resultado;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  aceptarRequisicion,
  cancelarRequisicion,
};
