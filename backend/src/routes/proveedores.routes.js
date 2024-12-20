const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db'); // Importa getPool correctamente
const pool = getPool(); // Obtén el pool inicializado

/**
 * CRUD para la entidad Proveedores
 */

/**
 * @swagger
 * /proveedores:
 *   get:
 *     summary: Obtiene todos los proveedores
 *     responses:
 *       200:
 *         description: Lista de todos los proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Proveedor:
 *                     type: integer
 *                   Nombre:
 *                     type: string
 */

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedores');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

// Ruta para contar proveedores
router.get('/count', async (req, res) => {
    try {
        const query = 'SELECT COUNT(*) AS total FROM proveedores';
        const result = await pool.query(query);
        res.status(200).json({ total: parseInt(result.rows[0].total, 10) });
    } catch (error) {
        console.error('Error al contar proveedores:', error);
        res.status(500).json({ error: 'Error al contar proveedores' });
    }
});

/**
 * @swagger
 * /proveedores/{id}:
 *   get:
 *     summary: Obtiene un proveedor por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proveedor a buscar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Proveedor:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *       404:
 *         description: Proveedor no encontrado
 */

// Obtener un proveedor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM proveedores WHERE "ID_Proveedor" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
});

/**
 * @swagger
 * /proveedores:
 *   post:
 *     summary: Crea un nuevo proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *                 description: Nombre del proveedor
 *                 example: Proveedor Nuevo
 *     responses:
 *       201:
 *         description: Proveedor creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Proveedor:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *       400:
 *         description: Error en los datos enviados
 */

// Crear un nuevo proveedor
router.post('/', async (req, res) => {
    const { Nombre } = req.body;

    // Validar campos obligatorios
    if (!Nombre) {
        return res.status(400).json({ error: 'El campo Nombre es obligatorio' });
    }

    try {
        const query = 'INSERT INTO proveedores ("Nombre") VALUES ($1) RETURNING *';
        const values = [Nombre];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
});

/**
 * @swagger
 * /proveedores/{id}:
 *   put:
 *     summary: Actualiza un proveedor existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proveedor a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *                 description: Nuevo nombre del proveedor
 *                 example: Proveedor Actualizado
 *     responses:
 *       200:
 *         description: Proveedor actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Proveedor:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *       404:
 *         description: Proveedor no encontrado
 *       400:
 *         description: Error en los datos enviados
 */

// Actualizar un proveedor existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Nombre } = req.body;

    // Validar campos obligatorios
    if (!Nombre) {
        return res.status(400).json({ error: 'El campo Nombre es obligatorio' });
    }

    try {
        const query = 'UPDATE proveedores SET "Nombre" = $1 WHERE "ID_Proveedor" = $2 RETURNING *';
        const values = [Nombre, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});


/**
 * @swagger
 * /proveedores/{id}:
 *   delete:
 *     summary: Elimina un proveedor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proveedor a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 proveedor:
 *                   type: object
 *                   properties:
 *                     ID_Proveedor:
 *                       type: integer
 *                     Nombre:
 *                       type: string
 *       404:
 *         description: Proveedor no encontrado
 */

// Eliminar un proveedor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM proveedores WHERE "ID_Proveedor" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor eliminado', proveedor: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
});



module.exports = router;
