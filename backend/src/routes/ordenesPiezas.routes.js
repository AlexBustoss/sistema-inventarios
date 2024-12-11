const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para la entidad Ordenes_Piezas
 */


/**
 * @swagger
 * /ordenes_piezas:
 *   get:
 *     summary: Obtiene todas las órdenes de piezas
 *     responses:
 *       200:
 *         description: Lista de órdenes de piezas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Orden:
 *                     type: integer
 *                   Folio:
 *                     type: string
 *                   Fecha_Registro:
 *                     type: string
 *                     format: date
 *                   Motivo:
 *                     type: string
 */


// Obtener todas las órdenes de piezas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ordenes_piezas');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener órdenes de piezas:', error);
        res.status(500).json({ error: 'Error al obtener órdenes de piezas' });
    }
});


/**
 * @swagger
 * /ordenes_piezas/{id}:
 *   get:
 *     summary: Obtiene una orden de piezas por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la orden a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la orden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Orden:
 *                   type: integer
 *                 Folio:
 *                   type: string
 *                 Fecha_Registro:
 *                   type: string
 *                   format: date
 *                 Motivo:
 *                   type: string
 *       404:
 *         description: Orden no encontrada
 */


// Obtener una orden de piezas por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM ordenes_piezas WHERE "ID_Orden" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener orden:', error);
        res.status(500).json({ error: 'Error al obtener orden' });
    }
});

/**
 * @swagger
 * /ordenes_piezas:
 *   post:
 *     summary: Crea una nueva orden de piezas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Folio:
 *                 type: string
 *               Fecha_Registro:
 *                 type: string
 *                 format: date
 *               Motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Orden:
 *                   type: integer
 *                 Folio:
 *                   type: string
 *                 Fecha_Registro:
 *                   type: string
 *                   format: date
 *                 Motivo:
 *                   type: string
 */


// Crear una nueva orden de piezas
router.post('/', async (req, res) => {
    const { Folio, Fecha_Registro, Motivo } = req.body;

    // Validar campos obligatorios
    if (!Folio || !Fecha_Registro || !Motivo) {
        return res.status(400).json({ error: 'Campos obligatorios: Folio, Fecha_Registro, Motivo' });
    }

    try {
        const query = `
            INSERT INTO ordenes_piezas ("Folio", "Fecha_Registro", "Motivo")
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [Folio, Fecha_Registro, Motivo];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ error: 'Error al crear orden' });
    }
});


/**
 * @swagger
 * /ordenes_piezas/{id}:
 *   put:
 *     summary: Actualiza una orden existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la orden a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Folio:
 *                 type: string
 *               Fecha_Registro:
 *                 type: string
 *                 format: date
 *               Motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orden actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Orden:
 *                   type: integer
 *                 Folio:
 *                   type: string
 *                 Fecha_Registro:
 *                   type: string
 *                   format: date
 *                 Motivo:
 *                   type: string
 *       404:
 *         description: Orden no encontrada
 */


// Actualizar una orden existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Folio, Fecha_Registro, Motivo } = req.body;

    // Validar campos obligatorios
    if (!Folio || !Fecha_Registro || !Motivo) {
        return res.status(400).json({ error: 'Campos obligatorios: Folio, Fecha_Registro, Motivo' });
    }

    try {
        const query = `
            UPDATE ordenes_piezas
            SET "Folio" = $1, "Fecha_Registro" = $2, "Motivo" = $3
            WHERE "ID_Orden" = $4
            RETURNING *;
        `;
        const values = [Folio, Fecha_Registro, Motivo, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        res.status(500).json({ error: 'Error al actualizar orden' });
    }
});

/**
 * @swagger
 * /ordenes_piezas/{id}:
 *   delete:
 *     summary: Elimina una orden existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la orden a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden eliminada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orden:
 *                   type: object
 *                   properties:
 *                     ID_Orden:
 *                       type: integer
 *                     Folio:
 *                       type: string
 *                     Fecha_Registro:
 *                       type: string
 *                       format: date
 *                     Motivo:
 *                       type: string
 *       404:
 *         description: Orden no encontrada
 */


// Eliminar una orden
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM ordenes_piezas WHERE "ID_Orden" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json({ message: 'Orden eliminada', orden: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar orden:', error);
        res.status(500).json({ error: 'Error al eliminar orden' });
    }
});

module.exports = router;
