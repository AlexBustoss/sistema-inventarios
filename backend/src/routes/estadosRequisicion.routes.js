const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para la entidad Estados de Requisición
 */


/**
 * @swagger
 * /estados_requisicion:
 *   get:
 *     summary: Obtiene todos los estados de requisición
 *     tags:
 *       - Estados Requisición
 *     responses:
 *       200:
 *         description: Lista de estados de requisición
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Estado:
 *                     type: integer
 *                   Descripcion:
 *                     type: string
 */


// Obtener todos los estados de requisición
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estados_requisicion');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener estados:', error);
        res.status(500).json({ error: 'Error al obtener estados' });
    }
});


/**
 * @swagger
 * /estados_requisicion/{id}:
 *   get:
 *     summary: Obtiene un estado de requisición por ID
 *     tags:
 *       - Estados Requisición
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del estado de requisición
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado de requisición encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Estado:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *       404:
 *         description: Estado no encontrado
 */


// Obtener un estado por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM estados_requisicion WHERE "ID_Estado" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener estado:', error);
        res.status(500).json({ error: 'Error al obtener estado' });
    }
});


/**
 * @swagger
 * /estados_requisicion:
 *   post:
 *     summary: Crea un nuevo estado de requisición
 *     tags:
 *       - Estados Requisición
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Descripcion:
 *                 type: string
 *                 example: "Estado adicional de prueba"
 *     responses:
 *       201:
 *         description: Estado de requisición creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Estado:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *       400:
 *         description: Campo obligatorio no proporcionado
 */


// Crear un nuevo estado
router.post('/', async (req, res) => {
    const { Descripcion } = req.body;

    // Validar campos obligatorios
    if (!Descripcion) {
        return res.status(400).json({ error: 'Campo obligatorio: Descripcion' });
    }

    try {
        const query = `
            INSERT INTO estados_requisicion ("Descripcion")
            VALUES ($1)
            RETURNING *;
        `;
        const values = [Descripcion];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear estado:', error);
        res.status(500).json({ error: 'Error al crear estado' });
    }
});

/**
 * @swagger
 * /estados_requisicion/{id}:
 *   put:
 *     summary: Actualiza un estado de requisición existente
 *     tags:
 *       - Estados Requisición
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del estado de requisición
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Descripcion:
 *                 type: string
 *                 example: "Tiempos de entrega actualizados"
 *     responses:
 *       200:
 *         description: Estado de requisición actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Estado:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *       404:
 *         description: Estado no encontrado
 *       400:
 *         description: Campo obligatorio no proporcionado
 */


// Actualizar un estado existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Descripcion } = req.body;

    // Validar campo obligatorio
    if (!Descripcion) {
        return res.status(400).json({ error: 'Campo obligatorio: Descripcion' });
    }

    try {
        const query = `
            UPDATE estados_requisicion
            SET "Descripcion" = $1
            WHERE "ID_Estado" = $2
            RETURNING *;
        `;
        const values = [Descripcion, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});


/**
 * @swagger
 * /estados_requisicion/{id}:
 *   delete:
 *     summary: Elimina un estado de requisición
 *     tags:
 *       - Estados Requisición
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del estado de requisición
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado de requisición eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 estado:
 *                   type: object
 *                   properties:
 *                     ID_Estado:
 *                       type: integer
 *                     Descripcion:
 *                       type: string
 *       404:
 *         description: Estado no encontrado
 */


// Eliminar un estado
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM estados_requisicion WHERE "ID_Estado" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }
        res.status(200).json({ message: 'Estado eliminado', estado: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar estado:', error);
        res.status(500).json({ error: 'Error al eliminar estado' });
    }
});

module.exports = router;
