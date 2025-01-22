const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db');
const pool = initPool();



// Obtener todas las unidades de medida
router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT "ID_Unidad", "Nombre" 
        FROM unidades_medida
        ORDER BY "ID_Unidad"
      `);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener unidades:', error);
      res.status(500).json({ error: 'Error al obtener unidades' });
    }
  });

// Obtener una unidad de medida por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM unidades_medida WHERE "ID_Unidad" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Unidad de medida no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);
        res.status(500).json({ error: 'Error al obtener la unidad de medida' });
    }
});

module.exports = router;