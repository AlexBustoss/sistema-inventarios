// requisiciones.service.js

const RequisicionesModel = require('../models/requisiciones.model');
const { getPool } = require('../config/db');
const pool = getPool();
console.log("🌐 Pool activo en requisiciones.service.js:", pool);
console.log("🌐 Métodos disponibles en pool:", Object.keys(pool || {}));
console.log("🛠 ¿pool tiene query?:", typeof pool.query === "function"); // Debe imprimir true

/**
 * Verifica si para cada ítem de `detalle_requisiciones` la suma en `stock_detallado`
 * (estado='asignada', id_requisicion= X) >= Cantidad_Solicitada.
 * Devuelve true si todo OK, o false + info de qué falta.
 */
async function verificarStockAsignado(idRequisicion) {
  // 1️⃣ Obtener detalles de la requisición con ID_Pieza y cantidad solicitada
  const detalleQuery = `
    SELECT "ID_Pieza", "Cantidad_Solicitada", dr.id_proyecto
    FROM detalle_requisiciones dr
    INNER JOIN requisiciones r ON dr."ID_Requisicion" = r."ID_Requisicion"
    WHERE dr."ID_Requisicion" = $1
  `;
  console.log("🔎 Verificando stock para requisición:", idRequisicion);
  console.log("🔎 Usando pool:", pool);
  console.log("🔎 Métodos disponibles en pool:", Object.keys(pool || {}));
  
  const { rows: detalles } = await pool.query(detalleQuery, [idRequisicion]);
  
  if (detalles.length === 0) {
    return { ok: false, faltantes: [], error: "No hay detalles en esta requisición." };
  }

  // 2️⃣ Verificar stock asignado para cada pieza
  let faltantes = [];
  
  for (const { ID_Pieza, Cantidad_Solicitada, id_proyecto } of detalles) {
    const stockQuery = `
      SELECT COALESCE(SUM(cantidad), 0) AS stock_asignado
      FROM stock_detallado
      WHERE id_pieza = $1 AND id_proyecto = $2 AND estado = 'asignada'
    `;
    console.log("🔎 Verificando stock para requisición:", idRequisicion);
  console.log("🔎 Usando pool:", pool);
  console.log("🔎 Métodos disponibles en pool:", Object.keys(pool || {}));

    const { rows } = await pool.query(stockQuery, [ID_Pieza, id_proyecto]);

    const stockAsignado = parseInt(rows[0].stock_asignado, 10);

    if (stockAsignado < Cantidad_Solicitada) {
      faltantes.push({ ID_Pieza, required: Cantidad_Solicitada, assigned: stockAsignado });
    }
  }

  return faltantes.length === 0 ? { ok: true, faltantes: [] } : { ok: false, faltantes };
}


/**
 * Consumir stock: puede ser DELETE FROM stock_detallado or set estado='consumido'
 * Aquí optamos por un "UPDATE" a 'consumido' para llevar historial.
 */
async function consumirStock(idRequisicion) {
  const updateQuery = `
    UPDATE stock_detallado
    SET estado='consumido'
    WHERE id_pieza IN (
      SELECT "ID_Pieza" FROM detalle_requisiciones WHERE "ID_Requisicion" = $1
    )
    AND id_proyecto = (SELECT id_proyecto FROM requisiciones WHERE "ID_Requisicion" = $1)
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
  // 1️⃣ Verificar que la requisición existe
  const requisicion = await RequisicionesModel.obtenerPorId(idRequisicion);
  if (!requisicion) {
    throw new Error('Requisición no encontrada');
  }

  // 2️⃣ Verificar que la requisición está en estado "Pendiente"
  if (requisicion.estadoRequisicion !== 'Pendiente') {
    throw new Error('Solo se pueden aceptar requisiciones en estado Pendiente');
  }

  // 3️⃣ Validar stock asignado
  const { ok, faltantes } = await verificarStockAsignado(idRequisicion);
  if (!ok) {
    throw new Error(`Stock insuficiente para algunas piezas: ${JSON.stringify(faltantes)}`);
  }

  // 4️⃣ Consumir stock
  await consumirStock(idRequisicion);

  // 5️⃣ Cambiar estado de la requisición a "Aceptada"
  return await RequisicionesModel.actualizarEstado(idRequisicion, 'Aceptada');
};




const cancelarRequisicion = async (idRequisicion) => {
  try {
      // 1️⃣ Verificar si la requisición existe y su estado actual
      const verificarRequisicionQuery = `
          SELECT estado FROM requisiciones WHERE "ID_Requisicion" = $1;
      `;
      const { rows } = await pool.query(verificarRequisicionQuery, [idRequisicion]);

      if (rows.length === 0) {
          throw new Error('Requisición no encontrada.');
      }

      const estadoActual = rows[0].estado;

      // 2️⃣ Si la requisición está en estado "Aceptada", revertir el stock
      if (estadoActual === 'Aceptada') {
          console.log("⚠️ Cancelando una requisición aceptada. Revirtiendo stock...");

          const revertirStockQuery = `
              UPDATE stock_detallado
              SET estado = 'libre', "ID_Requisicion" = NULL, id_proyecto = NULL
              WHERE "ID_Requisicion" = $1 AND estado = 'consumido';
          `;
          await pool.query(revertirStockQuery, [idRequisicion]);
      } else {
          // 3️⃣ Si la requisición aún no había sido aceptada, solo liberar stock asignado
          const liberarStockQuery = `
              UPDATE stock_detallado
              SET estado = 'libre', "ID_Requisicion" = NULL, id_proyecto = NULL
              WHERE "ID_Requisicion" = $1 AND estado = 'asignada';
          `;
          await pool.query(liberarStockQuery, [idRequisicion]);
      }

      // 4️⃣ Cambiar el estado de la requisición a "Cancelada"
      const actualizarRequisicionQuery = `
          UPDATE requisiciones SET estado = 'Cancelada' WHERE "ID_Requisicion" = $1;
      `;
      await pool.query(actualizarRequisicionQuery, [idRequisicion]);

      console.log(`✅ Requisición ${idRequisicion} cancelada con éxito.`);
      return { ok: true, message: 'Requisición cancelada y stock liberado.' };
      
  } catch (error) {
      console.error("❌ Error al cancelar requisición:", error);
      throw error;
  }
};

module.exports = {
  aceptarRequisicion,
  cancelarRequisicion
};
