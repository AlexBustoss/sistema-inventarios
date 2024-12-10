const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @swagger
 * /detalle_requisiciones:
 *   get:
 *     summary: Obtiene todos los detalles de requisiciones
 *     responses:
 *       200:
 *         description: Lista de detalles de requisiciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Detalle:
 *                     type: integer
 *                   ID_Requisicion:
 *                     type: integer
 *                   ID_Pieza:
 *                     type: integer
 *                   Cantidad:
 *                     type: integer
 *                   ID_Unidad:
 *                     type: integer
 */


// Obtener todos los detalles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM detalle_requisiciones');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
});

/**
 * @swagger
 * /detalle_requisiciones/{id}:
 *   get:
 *     summary: Obtiene un detalle de requisición por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del detalle de requisición a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de requisición encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Detalle:
 *                   type: integer
 *                 ID_Requisicion:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Cantidad:
 *                   type: integer
 *                 ID_Unidad:
 *                   type: integer
 *       404:
 *         description: Detalle no encontrado
 */


// Obtener detalle por ID de requisición
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM detalle_requisiciones WHERE "ID_Requisicion" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ error: 'Error al obtener detalle' });
    }
});

/**
 * @swagger
 * /detalle_requisiciones:
 *   post:
 *     summary: Crea un nuevo detalle de requisición
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Requisicion:
 *                 type: integer
 *               ID_Pieza:
 *                 type: integer
 *               Cantidad:
 *                 type: integer
 *               ID_Unidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Detalle creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Detalle:
 *                   type: integer
 *                 ID_Requisicion:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Cantidad:
 *                   type: integer
 *                 ID_Unidad:
 *                   type: integer
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error al crear detalle
 */


// Crear un nuevo detalle
router.post('/', async (req, res) => {
    const { ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad } = req.body;

    if (!ID_Requisicion || !ID_Pieza || !Cantidad || !ID_Unidad) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad' });
    }

    if (Cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        const query = `
            INSERT INTO detalle_requisiciones ("ID_Requisicion", "ID_Pieza", "Cantidad", "ID_Unidad")
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear detalle:', error);
        res.status(500).json({ error: 'Error al crear detalle' });
    }
});

/**
 * @swagger
 * /detalle_requisiciones/{id}:
 *   put:
 *     summary: Actualiza un detalle existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del detalle a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Requisicion:
 *                 type: integer
 *               ID_Pieza:
 *                 type: integer
 *               Cantidad:
 *                 type: integer
 *               ID_Unidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Detalle actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Detalle:
 *                   type: integer
 *                 ID_Requisicion:
 *                   type: integer
 *                 ID_Pieza:
 *                   type: integer
 *                 Cantidad:
 *                   type: integer
 *                 ID_Unidad:
 *                   type: integer
 *       404:
 *         description: Detalle no encontrado
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error al actualizar detalle
 */


// Actualizar un detalle existente
router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID del detalle a actualizar
    const { ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad } = req.body; // Valores del cuerpo de la solicitud

    // Validar que todos los campos obligatorios están presentes
    if (!ID_Requisicion || !ID_Pieza || !Cantidad || !ID_Unidad) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad' });
    }

    // Validar que la cantidad sea mayor a 0
    if (Cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        // Verificar que el detalle a actualizar existe
        const verificarDetalle = await pool.query(
            'SELECT * FROM detalle_requisiciones WHERE "ID_Detalle" = $1',
            [id]
        );
        if (verificarDetalle.rowCount === 0) {
            return res.status(404).json({ error: 'Detalle no encontrado.' });
        }

        // Verificar que la requisición existe
        const verificarRequisicion = await pool.query(
            'SELECT * FROM requisiciones WHERE "ID_Requisicion" = $1',
            [ID_Requisicion]
        );
        if (verificarRequisicion.rowCount === 0) {
            return res.status(400).json({ error: 'La requisición especificada no existe.' });
        }

        // Actualizar el detalle
        const query = `
            UPDATE detalle_requisiciones 
            SET "ID_Requisicion" = $1, "ID_Pieza" = $2, "Cantidad" = $3, "ID_Unidad" = $4
            WHERE "ID_Detalle" = $5
            RETURNING *;
        `;
        const values = [ID_Requisicion, ID_Pieza, Cantidad, ID_Unidad, id];

        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }

        res.status(200).json(result.rows[0]); // Detalle actualizado
    } catch (error) {
        console.error('Error al actualizar detalle:', error);
        res.status(500).json({ error: 'Error al actualizar detalle' });
    }
});


/**
 * @swagger
 * /detalle_requisiciones/{id}:
 *   delete:
 *     summary: Elimina un detalle de requisición
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del detalle a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 detalle:
 *                   type: object
 *                   properties:
 *                     ID_Detalle:
 *                       type: integer
 *                     ID_Requisicion:
 *                       type: integer
 *                     ID_Pieza:
 *                       type: integer
 *                     Cantidad:
 *                       type: integer
 *                     ID_Unidad:
 *                       type: integer
 *       404:
 *         description: Detalle no encontrado
 *       500:
 *         description: Error al eliminar detalle
 */


// Eliminar un detalle
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM detalle_requisiciones WHERE "ID_Detalle" = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }
        res.status(200).json({ message: 'Detalle eliminado', detalle: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar detalle:', error);
        res.status(500).json({ error: 'Error al eliminar detalle' });
    }
});


module.exports = router;
