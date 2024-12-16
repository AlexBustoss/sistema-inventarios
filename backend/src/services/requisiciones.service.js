const RequisicionesModel = require('../models/requisiciones.model');

const aceptarRequisicion = async (id) => {
    console.log(`ID recibido en servicio: ${id}`);

    // Obtener la requisición por ID
    const requisicion = await RequisicionesModel.obtenerPorId(id);
    console.log('Requisición obtenida:', requisicion);

    // Validar si la requisición existe
    if (!requisicion) {
        const error = new Error('Requisición no encontrada');
        error.status = 404;
        throw error;
    }

    // Log del estado actual
    console.log(`Estado actual de la requisición: ${requisicion.estadoRequisicion}`);

    // Validar que el estado sea "Pendiente"
    if (requisicion.Estado_Requisicion !== 'Pendiente') {
        const error = new Error('Solo se pueden aceptar requisiciones en estado Pendiente');
        error.status = 400;
        throw error;
    }
    

    // Actualizar el estado de la requisición a "Aceptada"
    const resultado = await RequisicionesModel.actualizarEstado(id, 'Aceptada');
    console.log('Resultado de la actualización:', resultado);

    return resultado;
};

const cancelarRequisicion = async (id) => {
    console.log(`ID recibido en servicio para cancelar: ${id}`);

    // Obtener la requisición por ID
    const requisicion = await RequisicionesModel.obtenerPorId(id);
    console.log('Requisición obtenida:', requisicion);

    // Validar si la requisición existe
    if (!requisicion) {
        const error = new Error('Requisición no encontrada');
        error.status = 404;
        throw error;
    }

    // Validar que la requisición esté en un estado permitido para cancelar
    if (!['Pendiente', 'Aceptada'].includes(requisicion.estadoRequisicion)) {
        const error = new Error('Solo se pueden cancelar requisiciones en estado Pendiente o Aceptada');
        error.status = 400;
        throw error;
    }

    // Actualizar el estado de la requisición a "Cancelada"
    const resultado = await RequisicionesModel.actualizarEstado(id, 'Cancelada');
    console.log('Resultado de la cancelación:', resultado);

    return resultado;
};

module.exports = {
    aceptarRequisicion,
    cancelarRequisicion,
};
