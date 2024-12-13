const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos


/**
 * @swagger
 * /unidades_medida:
 *   get:
 *     summary: Obtiene todas las unidades de medida
 *     responses:
 *       200:
 *         description: Lista de unidades de medida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Unidad:
 *                     type: integer
 *                   Nombre:
 *                     type: string
 */

// Obtener todas las unidades de medida
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM unidades_medida');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener unidades de medida:', error);
        res.status(500).json({ error: 'Error al obtener unidades de medida' });
    }
});

/**
 * @swagger
 * /unidades_medida/{id}:
 *   get:
 *     summary: Obtiene una unidad de medida por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la unidad de medida
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de una unidad de medida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Unidad:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *       404:
 *         description: Unidad de medida no encontrada
 */

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