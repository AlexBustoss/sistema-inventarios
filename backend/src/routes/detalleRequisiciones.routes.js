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

  // Valida lo mínimo
  if (!ID_Requisicion || !Cantidad_Solicitada) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: ID_Requisicion y Cantidad_Solicitada'
    });
  }
  if (Cantidad_Solicitada <= 0) {
    return res.status(400).json({ error: 'La cantidad solicitada debe ser mayor a 0' });
  }

  try {
    const query = `
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
  Fecha_Entrega || null
];


    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear detalle:', error);
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


module.exports = router;
