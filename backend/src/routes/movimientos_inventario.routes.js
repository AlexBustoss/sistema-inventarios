const express = require('express');
const router = express.Router();
const pool = require('../config/db');




// Obtener todos los movimientos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movimientos_inventario');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ error: 'Error al obtener movimientos' });
    }
});



// Obtener un movimiento por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM movimientos_inventario WHERE "ID_Movimiento" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener movimiento:', error);
        res.status(500).json({ error: 'Error al obtener movimiento' });
    }
});



// Crear un nuevo movimiento
router.post('/', async (req, res) => {
    const { ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo, ID_Requisicion } = req.body;

    // Validar campos obligatorios
    if (!ID_Pieza || !Fecha || !Cantidad || !Tipo_Movimiento || !Motivo) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo' });
    }

    try {
        const query = `
            INSERT INTO movimientos_inventario ("ID_Pieza", "Fecha", "Cantidad", "Tipo_Movimiento", "Motivo", "ID_Requisicion")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo, ID_Requisicion];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear movimiento:', error);
        res.status(500).json({ error: 'Error al crear movimiento' });
    }
});

// Actualizar un movimiento existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo, ID_Requisicion } = req.body;

    // Validar campos obligatorios
    if (!ID_Pieza || !Fecha || !Cantidad || !Tipo_Movimiento || !Motivo) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo' });
    }

    try {
        const query = `
            UPDATE movimientos_inventario
            SET "ID_Pieza" = $1, "Fecha" = $2, "Cantidad" = $3, "Tipo_Movimiento" = $4, "Motivo" = $5, "ID_Requisicion" = $6
            WHERE "ID_Movimiento" = $7
            RETURNING *;
        `;
        const values = [ID_Pieza, Fecha, Cantidad, Tipo_Movimiento, Motivo, ID_Requisicion, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar movimiento:', error);
        res.status(500).json({ error: 'Error al actualizar movimiento' });
    }
});


// Eliminar un movimiento
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM movimientos_inventario WHERE "ID_Movimiento" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }
        res.status(200).json({ message: 'Movimiento eliminado', movimiento: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar movimiento:', error);
        res.status(500).json({ error: 'Error al eliminar movimiento' });
    }
});

module.exports = router;
