// requisiciones.service.js

const RequisicionesModel = require('../models/requisiciones.model');
const pool = require('../config/db'); // Para hacer queries directos a la BD

/**
 * Verifica si para cada ítem de `detalle_requisiciones` la suma en `stock_detallado`
 * (estado='asignada', id_requisicion= X) >= Cantidad_Solicitada.
 * Devuelve true si todo OK, o false + info de qué falta.
 */
async function verificarStockAsignado(idRequisicion) {
  // 1. Obtener todos los renglones de detalle para esa requisición
  const detalleQuery = `
    SELECT "ID_Detalle", "Cantidad_Solicitada", "ID_Detalle" 
    FROM detalle_requisiciones
    WHERE "ID_Requisicion" = $1
  `;
  const { rows: items } = await pool.query(detalleQuery, [idRequisicion]);

  if (items.length === 0) {
    // Si no hay ítems, consideramos que no hay nada que verificar
    return { ok: true, faltantes: [] };
  }

  // 2. Para cada ítem, sumar en stock_detallado
  //    la cantidad con estado='asignada', id_requisicion = X
  //    y comparar con Cantidad_Solicitada
  let todoOk = true;
  const faltantes = [];

  for (const item of items) {
    const sumQuery = `
      SELECT COALESCE(SUM(cantidad),0) AS total_asignado
      FROM stock_detallado
      WHERE "ID_Requisicion" = $1
        AND estado = 'asignada'
        -- opcional: AND id_pieza=? si usaras ID_Pieza para matchear con item
    `;
    const { rows } = await pool.query(sumQuery, [idRequisicion]);
    const totalAsignado = parseInt(rows[0].total_asignado, 10);

    if (totalAsignado < item.Cantidad_Solicitada) {
      // Este ítem no está completamente asignado
      todoOk = false;
      faltantes.push({
        idDetalle: item.ID_Detalle,
        required: item.Cantidad_Solicitada,
        assigned: totalAsignado
      });
    }
  }

  return { ok: todoOk, faltantes };
}

/**
 * Consumir stock: puede ser DELETE FROM stock_detallado or set estado='consumido'
 * Aquí optamos por un "UPDATE" a 'consumido' para llevar historial.
 */
async function consumirStock(idRequisicion) {
  const updateQuery = `
    UPDATE stock_detallado
    SET estado='consumido'
    WHERE "ID_Requisicion" = $1
      AND estado = 'asignada'
  `;
  await pool.query(updateQuery, [idRequisicion]);
}

/**
 * Liberar stock: id_requisicion=NULL, id_proyecto=NULL, estado='libre'
 */
async function liberarStock(idRequisicion) {
  const updateQuery = `
    UPDATE stock_detallado
    SET estado='libre', "ID_Requisicion"=NULL, id_proyecto=NULL
    WHERE "ID_Requisicion" = $1 AND estado='asignada'
  `;
  await pool.query(updateQuery, [idRequisicion]);
}

// ===================
// Funciones principales
// ===================

const aceptarRequisicion = async (idRequisicion) => {
  // 1. Verificar que la requisición existe
  const requisicion = await RequisicionesModel.obtenerPorId(idRequisicion);
  if (!requisicion) {
    const error = new Error('Requisición no encontrada');
    error.status = 404;
    throw error;
  }

  // 2. Checar estado actual
  if (!['Pendiente', 'Activa'].includes(requisicion.estadoRequisicion)) {
    const error = new Error(`No se puede aceptar una requisición en estado ${requisicion.estadoRequisicion}`);
    error.status = 400;
    throw error;
  }

  // 3. Verificar stock asignado
  const { ok, faltantes } = await verificarStockAsignado(idRequisicion);
  if (!ok) {
    const error = new Error('No hay suficiente stock asignado para todos los ítems');
    error.status = 400;
    error.detalle = faltantes;
    throw error;
  }

  // 4. Consumir el stock
  await consumirStock(idRequisicion);

  // 5. Actualizar el estado de la requisición a "Aceptada"
  const resultado = await RequisicionesModel.actualizarEstado(idRequisicion, 'Aceptada');
  return resultado; // Devuelve la requisición actualizada
};


const cancelarRequisicion = async (idRequisicion) => {
  // 1. Obtener la requisición
  const requisicion = await RequisicionesModel.obtenerPorId(idRequisicion);
  if (!requisicion) {
    const error = new Error('Requisición no encontrada');
    error.status = 404;
    throw error;
  }

  // 2. Validar estado actual
  if (!['Pendiente', 'Activa', 'Aceptada'].includes(requisicion.estadoRequisicion)) {
    const error = new Error(`No se puede cancelar una requisición en estado ${requisicion.estadoRequisicion}`);
    error.status = 400;
    throw error;
  }

  // 3. Liberar stock (estado='asignada') => 'libre'
  await liberarStock(idRequisicion);

  // 4. Actualizar la requisición a 'Cancelada'
  const resultado = await RequisicionesModel.actualizarEstado(idRequisicion, 'Cancelada');
  return resultado;
};

module.exports = {
  aceptarRequisicion,
  cancelarRequisicion
};
