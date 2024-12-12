const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * CRUD para la entidad Movimientos de Inventario
 */

/**
 * @swagger
 * /movimientos_inventario:
 *   get:
 *     summary: Obtiene todos los movimientos de inventario
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Movimiento:
 *                     type: integer
 *                   ID_Pieza:
 *                     type: integer
 *                   Fecha:
 *                     type: string
 *                     format: date
 *                   Cantidad:
 *                     type: integer
 *                   Tipo_Movimiento:
 *                     type: string
 *                   Motivo:
 *                     type: string
 *                   ID_Requisicion:
 *                     type: integer
 */



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


/**
 * @swagger
 * /movimientos_inventario/{id}:
 *   get:
 *     summary: Obtiene un movimiento de inventario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del movimiento de inventario a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento de inventario obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Movimiento:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 Cantidad:
 *                   type: integer
 *                 Tipo_Movimiento:
 *                   type: string
 *                 Motivo:
 *                   type: string
 *                 ID_Requisicion:
 *                   type: integer
 *       404:
 *         description: Movimiento no encontrado
 */



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


/**
 * @swagger
 * /movimientos_inventario:
 *   post:
 *     summary: Crea un nuevo movimiento de inventario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Pieza:
 *                 type: integer
 *               Fecha:
 *                 type: string
 *                 format: date
 *               Cantidad:
 *                 type: integer
 *               Tipo_Movimiento:
 *                 type: string
 *               Motivo:
 *                 type: string
 *               ID_Requisicion:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Movimiento creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Movimiento:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 Cantidad:
 *                   type: integer
 *                 Tipo_Movimiento:
 *                   type: string
 *                 Motivo:
 *                   type: string
 *                 ID_Requisicion:
 *                   type: integer
 *       400:
 *         description: Error en los campos requeridos
 *       500:
 *         description: Error al crear el movimiento
 */


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

/**
 * @swagger
 * /movimientos_inventario/{id}:
 *   put:
 *     summary: Actualiza un movimiento de inventario existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del movimiento a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Pieza:
 *                 type: integer
 *               Fecha:
 *                 type: string
 *                 format: date
 *               Cantidad:
 *                 type: integer
 *               Tipo_Movimiento:
 *                 type: string
 *               Motivo:
 *                 type: string
 *               ID_Requisicion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Movimiento actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Movimiento:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 Cantidad:
 *                   type: integer
 *                 Tipo_Movimiento:
 *                   type: string
 *                 Motivo:
 *                   type: string
 *                 ID_Requisicion:
 *                   type: integer
 *       404:
 *         description: Movimiento no encontrado
 *       400:
 *         description: Error en los campos requeridos
 *       500:
 *         description: Error al actualizar el movimiento
 */


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


/**
 * @swagger
 * /movimientos_inventario/{id}:
 *   delete:
 *     summary: Elimina un movimiento de inventario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del movimiento a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     ID_Movimiento:
 *                       type: integer
 *                     ID_Pieza:
 *                       type: integer
 *                     Fecha:
 *                       type: string
 *                       format: date
 *                     Cantidad:
 *                       type: integer
 *                     Tipo_Movimiento:
 *                       type: string
 *                     Motivo:
 *                       type: string
 *                     ID_Requisicion:
 *                       type: integer
 *       404:
 *         description: Movimiento no encontrado
 */


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
