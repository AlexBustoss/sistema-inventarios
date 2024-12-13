// Importaciones necesarias
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * CRUD para la entidad Piezas_Proveedores
 */

/**
 * @swagger
 * /piezas_proveedores:
 *   get:
 *     summary: Obtiene todas las relaciones entre piezas y proveedores
 *     responses:
 *       200:
 *         description: Lista de todas las relaciones entre piezas y proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Pieza:
 *                     type: integer
 *                     description: ID de la pieza
 *                   ID_Proveedor:
 *                     type: integer
 *                     description: ID del proveedor
 */

// Obtener todas las relaciones de piezas y proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM piezas_proveedores');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener piezas-proveedores:', error);
        res.status(500).json({ error: 'Error al obtener piezas-proveedores' });
    }
});

/**
 * @swagger
 * /piezas_proveedores/{id_pieza}/{id_proveedor}:
 *   get:
 *     summary: Obtiene una relación específica entre una pieza y un proveedor
 *     parameters:
 *       - in: path
 *         name: id_pieza
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la pieza
 *       - in: path
 *         name: id_proveedor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor
 *     responses:
 *       200:
 *         description: Relación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *       404:
 *         description: Relación no encontrada
 */

// Obtener una relación específica por ID_Pieza e ID_Proveedor
router.get('/:id_pieza/:id_proveedor', async (req, res) => {
    const { id_pieza, id_proveedor } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM piezas_proveedores WHERE "ID_Pieza" = $1 AND "ID_Proveedor" = $2',
            [id_pieza, id_proveedor]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Relación pieza-proveedor no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener pieza-proveedor:', error);
        res.status(500).json({ error: 'Error al obtener pieza-proveedor' });
    }
});

/**
 * @swagger
 * /piezas_proveedores:
 *   post:
 *     summary: Crea una nueva relación entre una pieza y un proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Pieza:
 *                 type: integer
 *               ID_Proveedor:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Relación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *       400:
 *         description: Campos obligatorios faltantes o inválidos
 */

// Crear una nueva relación pieza-proveedor
router.post('/', async (req, res) => {
    const { ID_Pieza, ID_Proveedor } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!ID_Pieza || !ID_Proveedor) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, ID_Proveedor' });
    }

    try {
        const query = `
            INSERT INTO piezas_proveedores ("ID_Pieza", "ID_Proveedor")
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [ID_Pieza, ID_Proveedor];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear relación pieza-proveedor:', error);
        res.status(500).json({ error: 'Error al crear relación pieza-proveedor' });
    }
});

/**
 * @swagger
 * /piezas_proveedores/{id_pieza}/{id_proveedor}:
 *   put:
 *     summary: Actualiza una relación específica entre una pieza y un proveedor
 *     parameters:
 *       - in: path
 *         name: id_pieza
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la pieza existente
 *       - in: path
 *         name: id_proveedor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor existente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Pieza:
 *                 type: integer
 *                 description: Nuevo ID de la pieza
 *               ID_Proveedor:
 *                 type: integer
 *                 description: Nuevo ID del proveedor
 *     responses:
 *       200:
 *         description: Relación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Pieza:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Relación no encontrada
 */

// Actualizar una relación pieza-proveedor
router.put('/:id_pieza/:id_proveedor', async (req, res) => {
    const { id_pieza, id_proveedor } = req.params;
    const { ID_Pieza, ID_Proveedor } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!ID_Pieza || !ID_Proveedor) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, ID_Proveedor' });
    }

    try {
        const query = `
            UPDATE piezas_proveedores
            SET "ID_Pieza" = $1, "ID_Proveedor" = $2
            WHERE "ID_Pieza" = $3 AND "ID_Proveedor" = $4
            RETURNING *;
        `;
        const values = [ID_Pieza, ID_Proveedor, id_pieza, id_proveedor];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Relación pieza-proveedor no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar relación pieza-proveedor:', error);
        res.status(500).json({ error: 'Error al actualizar relación pieza-proveedor' });
    }
});

/**
 * @swagger
 * /piezas_proveedores/{id_pieza}/{id_proveedor}:
 *   delete:
 *     summary: Elimina una relación específica entre una pieza y un proveedor
 *     parameters:
 *       - in: path
 *         name: id_pieza
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la pieza
 *       - in: path
 *         name: id_proveedor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor
 *     responses:
 *       200:
 *         description: Relación eliminada exitosamente
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
 *                     ID_Pieza:
 *                       type: integer
 *                     ID_Proveedor:
 *                       type: integer
 *       404:
 *         description: Relación no encontrada
 */

// Eliminar una relación pieza-proveedor
router.delete('/:id_pieza/:id_proveedor', async (req, res) => {
    const { id_pieza, id_proveedor } = req.params;

    try {
        const query = `
            DELETE FROM piezas_proveedores
            WHERE "ID_Pieza" = $1 AND "ID_Proveedor" = $2
            RETURNING *;
        `;
        const values = [id_pieza, id_proveedor];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Relación pieza-proveedor no encontrada' });
        }
        res.status(200).json({ message: 'Relación pieza-proveedor eliminada', relacion: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar relación pieza-proveedor:', error);
        res.status(500).json({ error: 'Error al eliminar relación pieza-proveedor' });
    }
});

module.exports = router;
