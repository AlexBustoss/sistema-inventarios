const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db'); // Importa getPool
const pool = getPool(); // Obtén el pool inicializado

// ============================
//  GET /api/detalleRequisiciones
//  Lista TODO el contenido de detalle_requisiciones
// ============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM detalle_requisiciones');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener detalles:', error);
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
});

// ✅ Ruta para consultar el historial de entregas de una pieza en una requisición
router.get('/bitacora/:idRequisicion/:idPieza', async (req, res) => {
  const { idRequisicion, idPieza } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          cantidad_entregada, 
          fecha_entrega
      FROM entregas_requisicion
      WHERE id_requisicion = $1 AND id_pieza = $2
      ORDER BY fecha_entrega ASC`
,
      [idRequisicion, idPieza]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener bitácora de entregas:", error);
    res.status(500).json({ error: 'Error al obtener bitácora de entregas' });
  }
});

// ============================
//  GET /api/detalleRequisiciones/:idRequisicion
//  Obtiene todos los renglones de una requisición en particular
// ============================
router.get('/:idRequisicion', async (req, res) => {
  const { idRequisicion } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        "ID_Detalle",
        "ID_Requisicion",
        "ID_Pieza",
        "ID_Unidad",
        "Cantidad_Solicitada",
        "Marca",
        "No_Parte",
        "Descripcion",
        "Cantidad_Entregada",
        "Fecha_Entrega"
      FROM detalle_requisiciones
      WHERE "ID_Requisicion" = $1
    `, [idRequisicion]);

    // Si no hay filas, devolvemos array vacío (no forzosamente 404)
    // Eres libre de decidir la respuesta en ese caso.
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
});

// ============================
//  POST /api/detalleRequisiciones
//  Crea un renglón nuevo en detalle_requisiciones
// ============================
router.post('/', async (req, res) => {
  const {
    ID_Requisicion,
    ID_Pieza,
    ID_Unidad,
    Cantidad_Solicitada,
    id_proyecto,
    Marca,
    No_Parte,
    Descripcion,
    Cantidad_Entregada,
    Fecha_Entrega
  } = req.body;

  console.log("📥 Datos recibidos en el backend:", req.body);

  // Validación de los campos obligatorios
  if (!ID_Requisicion || !Cantidad_Solicitada || !ID_Pieza) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (Cantidad_Solicitada <= 0) {
    return res.status(400).json({ error: 'La cantidad solicitada debe ser mayor a 0' });
  }

  try {
    // 🔹 1. Insertar en detalle_requisiciones
    const queryDetalle = `
      INSERT INTO detalle_requisiciones (
        "ID_Requisicion",
        "ID_Pieza",
        "ID_Unidad",
        "Cantidad_Solicitada",
        "id_proyecto",
        "Marca",
        "No_Parte",
        "Descripcion",
        "Cantidad_Entregada",
        "Fecha_Entrega"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const valuesDetalle = [
      ID_Requisicion,
      ID_Pieza,
      ID_Unidad || null,
      Cantidad_Solicitada,
      id_proyecto || null,
      Marca || "SIN MARCA",
      No_Parte || "SIN NÚMERO DE PARTE",
      Descripcion || "SIN DESCRIPCIÓN",
      Cantidad_Entregada || 0,
      Fecha_Entrega || null
    ];

    const resultDetalle = await pool.query(queryDetalle, valuesDetalle);
    console.log("✅ Detalle registrado:", resultDetalle.rows[0]);

    // 🔹 2. Revisar stock disponible
    const stockDisponibleQuery = `
      SELECT SUM(cantidad) AS total_disponible FROM stock_detallado 
      WHERE id_pieza = $1 AND id_proyecto IS NULL;
    `;
    const stockDisponibleRes = await pool.query(stockDisponibleQuery, [ID_Pieza]);
    const stockDisponible = stockDisponibleRes.rows[0].total_disponible || 0;

    console.log(`📦 Stock libre disponible para la pieza ${ID_Pieza}:`, stockDisponible);

    // 🔹 3. Si hay stock suficiente, asignarlo al proyecto
    if (stockDisponible >= Cantidad_Solicitada) {
      const asignarStockQuery = `
          WITH piezas_actualizadas AS (
              SELECT id_stock FROM stock_detallado
              WHERE id_pieza = $1 AND id_proyecto IS NULL
              LIMIT $2
          )
          UPDATE stock_detallado
          SET id_proyecto = $3, estado = 'asignada', "ID_Requisicion" = $4
          WHERE id_stock IN (SELECT id_stock FROM piezas_actualizadas);

      `;
      await pool.query(asignarStockQuery, [ID_Pieza, Cantidad_Solicitada, id_proyecto, ID_Requisicion]);
      console.log("🔹 Stock asignado al proyecto", id_proyecto);


      console.log("🔹 Stock asignado al proyecto", id_proyecto);
    } if (stockDisponible < Cantidad_Solicitada) {
      console.log("⚠️ Stock insuficiente, se mantiene en estado 'Pendiente'.");
      return res.status(201).json({
        detalle: resultDetalle.rows[0],
        pendientes: true, // <-- Notificación al frontend de que faltan piezas
        mensaje: `Stock insuficiente para la pieza ${ID_Pieza}.`
      });
    }
    

    res.status(201).json(resultDetalle.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear detalle:", error);
    res.status(500).json({ error: 'Error al crear detalle' });
  }
});

// ============================
//  PUT /api/detalleRequisiciones/:idDetalle
//  Actualiza un renglón existente
// ============================
router.put('/:idDetalle', async (req, res) => {
  const { idDetalle } = req.params;
  const {
    ID_Requisicion,
    ID_Pieza,
    ID_Unidad,
    Cantidad_Solicitada,
    id_proyecto,
    Marca,
    No_Parte,
    Descripcion,
    Cantidad_Entregada,
    Fecha_Entrega
  } = req.body;

  // Chequeos básicos
  if (!ID_Requisicion || !Cantidad_Solicitada) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: ID_Requisicion y Cantidad_Solicitada'
    });
  }
  if (Cantidad_Solicitada <= 0) {
    return res.status(400).json({ error: 'La cantidad solicitada debe ser mayor a 0' });
  }

  try {
    // Verificar que existe
    const verificar = await pool.query(
      'SELECT * FROM detalle_requisiciones WHERE "ID_Detalle" = $1', 
      [idDetalle]
    );
    if (verificar.rowCount === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado.' });
    }

    const query = `
      UPDATE detalle_requisiciones
        SET
            "ID_Requisicion" = $1,
            "ID_Pieza" = $2,
            "ID_Unidad" = $3,
            "Cantidad_Solicitada" = $4,
            "id_proyecto" = $5,   -- ← Agregado aquí
            "Marca" = $6,
            "No_Parte" = $7,
            "Descripcion" = $8,
            "Cantidad_Entregada" = $9,
            "Fecha_Entrega" = $10
        WHERE "ID_Detalle" = $11
        RETURNING *;
`;
    const values = [
      ID_Requisicion,
      ID_Pieza || null,
      ID_Unidad || null,
      Cantidad_Solicitada,
      id_proyecto || null,
      Marca || null,
      No_Parte || null,
      Descripcion || null,
      Cantidad_Entregada || null,
      Fecha_Entrega || null,
      idDetalle
    ];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado al actualizar' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar detalle:', error);
    res.status(500).json({ error: 'Error al actualizar detalle' });
  }
});

// ============================
//  DELETE /api/detalleRequisiciones/:idDetalle
//  Elimina un renglón
// ============================
router.delete('/:idDetalle', async (req, res) => {
  const { idDetalle } = req.params;

  try {
    const query = `
      DELETE FROM detalle_requisiciones
      WHERE "ID_Detalle" = $1
      RETURNING *
    `;
    const result = await pool.query(query, [idDetalle]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    res.status(200).json({ 
      message: 'Detalle eliminado', 
      detalle: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al eliminar detalle:', error);
    res.status(500).json({ error: 'Error al eliminar detalle' });
  }
});


// ✅ Nueva ruta: Actualizar entrega acumulada de una pieza
router.put('/entregar/:idRequisicion/:idPieza', async (req, res) => {
  const { idRequisicion, idPieza } = req.params;
  const { cantidadEntregadaNueva, fechaEntrega } = req.body;
  console.log("🧪 Body recibido:", req.body);
  console.log("🧪 Cantidad:", cantidadEntregadaNueva);

  if (!cantidadEntregadaNueva || isNaN(cantidadEntregadaNueva)) {
    return res.status(400).json({ error: 'Cantidad entregada inválida' });
  }

  try {
    // 1️⃣ Obtener la cantidad entregada actual
    const consulta = await pool.query(
      'SELECT "Cantidad_Entregada" FROM detalle_requisiciones WHERE "ID_Requisicion" = $1 AND "ID_Pieza" = $2',
      [idRequisicion, idPieza]
    );

    if (consulta.rowCount === 0) {
      return res.status(404).json({ error: 'Pieza no encontrada en esta requisición' });
    }

    const cantidadActual = consulta.rows[0].Cantidad_Entregada || 0;
    const nuevaCantidadTotal = cantidadActual + parseInt(cantidadEntregadaNueva);

    // 2️⃣ Actualizar la cantidad entregada (sumando)
    const update = await pool.query(
      `UPDATE detalle_requisiciones
      SET "Cantidad_Entregada" = $1,
          "Fecha_Entrega" = $2
      WHERE "ID_Requisicion" = $3 AND "ID_Pieza" = $4
      RETURNING *;`,
      [nuevaCantidadTotal, fechaEntrega || null, idRequisicion, idPieza]
    );
    // Insertar en la bitácora
    await pool.query(
      `INSERT INTO entregas_requisicion 
       (id_requisicion, id_pieza, cantidad_entregada, fecha_entrega)
       VALUES ($1, $2, $3, $4);`,
      [idRequisicion, idPieza, cantidadEntregadaNueva, fechaEntrega || null]
    );
    


    res.status(200).json({ message: 'Entrega actualizada correctamente', data: update.rows[0] });
  } catch (error) {
    console.error('❌ Error al entregar pieza:', error);
    res.status(500).json({ error: 'Error al entregar pieza' });
  }
});




module.exports = router;
