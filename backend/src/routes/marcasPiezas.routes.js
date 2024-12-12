const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para la entidad Marcas_Piezas
 */

/**
 * @swagger
 * /marcas_piezas:
 *   get:
 *     summary: Obtiene todas las marcas de piezas
 *     responses:
 *       200:
 *         description: Lista de marcas de piezas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Pieza:
 *                     type: integer
 *                   Marca:
 *                     type: string
 *                   Descripcion:
 *                     type: string
 */


// Obtener todas las marcas de piezas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM marcas_piezas');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener marcas de piezas:', error);
        res.status(500).json({ error: 'Error al obtener marcas de piezas' });
    }
});

/**
 * @swagger
 * /marcas_piezas/{id}:
 *   get:
 *     summary: Obtiene una marca de pieza por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la marca de pieza a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marca de pieza encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Marca:
 *                   type: string
 *                 Descripcion:
 *                   type: string
 *       404:
 *         description: Marca de pieza no encontrada
 */


// Obtener una marca de pieza por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM marcas_piezas WHERE "ID_Pieza" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener marca de pieza:', error);
        res.status(500).json({ error: 'Error al obtener marca de pieza' });
    }
});

/**
 * @swagger
 * /marcas_piezas:
 *   post:
 *     summary: Crea una nueva marca de pieza
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Pieza:
 *                 type: integer
 *               Marca:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Marca de pieza creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Marca:
 *                   type: string
 *                 Descripcion:
 *                   type: string
 *       400:
 *         description: Error de validación
 */


// Crear una nueva marca de pieza
router.post('/', async (req, res) => {
    const { ID_Pieza, Marca, Descripcion } = req.body;

    // Validar campos obligatorios
    if (!ID_Pieza || !Marca || !Descripcion) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, Marca, Descripcion' });
    }

    try {
        const query = `
            INSERT INTO marcas_piezas ("ID_Pieza", "Marca", "Descripcion")
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [ID_Pieza, Marca, Descripcion];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear marca de pieza:', error);
        res.status(500).json({ error: 'Error al crear marca de pieza' });
    }
});


/**
 * @swagger
 * /marcas_piezas/{id}:
 *   put:
 *     summary: Actualiza una marca de pieza existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la marca de pieza a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Marca:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marca de pieza actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Marca:
 *                   type: string
 *                 Descripcion:
 *                   type: string
 *       404:
 *         description: Marca de pieza no encontrada
 */


// Actualizar una marca de pieza existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Marca, Descripcion } = req.body;

    // Validar campos obligatorios
    if (!Marca || !Descripcion) {
        return res.status(400).json({ error: 'Campos obligatorios: Marca, Descripcion' });
    }

    try {
        const query = `
            UPDATE marcas_piezas
            SET "Marca" = $1, "Descripcion" = $2
            WHERE "ID_Pieza" = $3
            RETURNING *;
        `;
        const values = [Marca, Descripcion, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar marca de pieza:', error);
        res.status(500).json({ error: 'Error al actualizar marca de pieza' });
    }
});

/**
 * @swagger
 * /marcas_piezas/{id}:
 *   delete:
 *     summary: Elimina una marca de pieza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la marca de pieza a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marca de pieza eliminada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 marca:
 *                   type: object
 *                   properties:
 *                     ID_Pieza:
 *                       type: integer
 *                     Marca:
 *                       type: string
 *                     Descripcion:
 *                       type: string
 *       404:
 *         description: Marca de pieza no encontrada
 */


// Eliminar una marca de pieza
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM marcas_piezas WHERE "ID_Pieza" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json({ message: 'Marca de pieza eliminada', marcaPieza: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar marca de pieza:', error);
        res.status(500).json({ error: 'Error al eliminar marca de pieza' });
    }
});

module.exports = router;
