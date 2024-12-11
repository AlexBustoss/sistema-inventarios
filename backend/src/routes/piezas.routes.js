const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para la entidad Piezas
 */

/**
 * @swagger
 * /piezas:
 *   get:
 *     summary: Obtiene todas las piezas
 *     responses:
 *       200:
 *         description: Lista de todas las piezas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Pieza:
 *                     type: integer
 *                   Descripcion:
 *                     type: string
 *                   Marca:
 *                     type: string
 *                   Ubicacion:
 *                     type: string
 *                   Stock_Actual:
 *                     type: integer
 *                   Stock_Minimo:
 *                     type: integer
 *                   ID_Orden:
 *                     type: integer
 */


// Obtener todas las piezas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM piezas');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener piezas:', error);
        res.status(500).json({ error: 'Error al obtener piezas' });
    }
});


/**
 * @swagger
 * /piezas/{id}:
 *   get:
 *     summary: Obtiene una pieza por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la pieza a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la pieza
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *                 Marca:
 *                   type: string
 *                 Ubicacion:
 *                   type: string
 *                 Stock_Actual:
 *                   type: integer
 *                 Stock_Minimo:
 *                   type: integer
 *                 ID_Orden:
 *                   type: integer
 *       404:
 *         description: Pieza no encontrada
 */


// Obtener una pieza por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM piezas WHERE "ID_Pieza" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener pieza:', error);
        res.status(500).json({ error: 'Error al obtener pieza' });
    }
});


/**
 * @swagger
 * /piezas:
 *   post:
 *     summary: Crea una nueva pieza
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Descripcion:
 *                 type: string
 *               Marca:
 *                 type: string
 *               Ubicacion:
 *                 type: string
 *               Stock_Actual:
 *                 type: integer
 *               Stock_Minimo:
 *                 type: integer
 *               ID_Orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pieza creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *                 Marca:
 *                   type: string
 *                 Ubicacion:
 *                   type: string
 *                 Stock_Actual:
 *                   type: integer
 *                 Stock_Minimo:
 *                   type: integer
 *                 ID_Orden:
 *                   type: integer
 *       400:
 *         description: Error de validación en los campos
 */


// Crear una nueva pieza
router.post('/', async (req, res) => {
    const { Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden } = req.body;

    // Validar campos obligatorios
    if (!Descripcion || !Marca || !Ubicacion || Stock_Actual === undefined || Stock_Minimo === undefined || !ID_Orden) {
        return res.status(400).json({ error: 'Campos obligatorios: Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden' });
    }

    try {
        const query = `
            INSERT INTO piezas ("Descripcion", "Marca", "Ubicacion", "Stock_Actual", "Stock_Minimo", "ID_Orden")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear pieza:', error);
        res.status(500).json({ error: 'Error al crear pieza' });
    }
});


/**
 * @swagger
 * /piezas/{id}:
 *   put:
 *     summary: Actualiza una pieza existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la pieza a actualizar
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
 *               Marca:
 *                 type: string
 *               Ubicacion:
 *                 type: string
 *               Stock_Actual:
 *                 type: integer
 *               Stock_Minimo:
 *                 type: integer
 *               ID_Orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pieza actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 Descripcion:
 *                   type: string
 *                 Marca:
 *                   type: string
 *                 Ubicacion:
 *                   type: string
 *                 Stock_Actual:
 *                   type: integer
 *                 Stock_Minimo:
 *                   type: integer
 *                 ID_Orden:
 *                   type: integer
 *       404:
 *         description: Pieza no encontrada
 */



// Actualizar una pieza existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden } = req.body;

    // Validar campos obligatorios
    if (!Descripcion || !Marca || !Ubicacion || Stock_Actual === undefined || Stock_Minimo === undefined || !ID_Orden) {
        return res.status(400).json({ error: 'Campos obligatorios: Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden' });
    }

    try {
        const query = `
            UPDATE piezas
            SET "Descripcion" = $1, "Marca" = $2, "Ubicacion" = $3, "Stock_Actual" = $4, "Stock_Minimo" = $5, "ID_Orden" = $6
            WHERE "ID_Pieza" = $7
            RETURNING *;
        `;
        const values = [Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar pieza:', error);
        res.status(500).json({ error: 'Error al actualizar pieza' });
    }
});


/**
 * @swagger
 * /piezas/{id}:
 *   delete:
 *     summary: Elimina una pieza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la pieza a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pieza eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pieza:
 *                   type: object
 *                   properties:
 *                     ID_Pieza:
 *                       type: integer
 *                     Descripcion:
 *                       type: string
 *                     Marca:
 *                       type: string
 *                     Ubicacion:
 *                       type: string
 *                     Stock_Actual:
 *                       type: integer
 *                     Stock_Minimo:
 *                       type: integer
 *                     ID_Orden:
 *                       type: integer
 *       404:
 *         description: Pieza no encontrada
 */


// Eliminar una pieza
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM piezas WHERE "ID_Pieza" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        res.status(200).json({ message: 'Pieza eliminada', pieza: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar pieza:', error);
        res.status(500).json({ error: 'Error al eliminar pieza' });
    }
});

module.exports = router;
