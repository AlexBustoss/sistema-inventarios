const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para la entidad Ubicaciones Proveedores
 */

/**
 * @swagger
 * /api/ubicaciones_proveedores:
 *   get:
 *     summary: Obtiene todas las ubicaciones de proveedores
 *     tags:
 *       - Ubicaciones Proveedores
 *     responses:
 *       200:
 *         description: Lista de ubicaciones de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Ubicacion:
 *                     type: integer
 *                   ID_Proveedor:
 *                     type: integer
 *                   Direccion:
 *                     type: string
 *                   Telefono:
 *                     type: string
 *                   Email:
 *                     type: string
 */

// Obtener todas las ubicaciones de proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ubicaciones_proveedores');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener ubicaciones de proveedores:', error);
        res.status(500).json({ error: 'Error al obtener ubicaciones de proveedores' });
    }
});

/**
 * @swagger
 * /api/ubicaciones_proveedores/{id}:
 *   get:
 *     summary: Obtiene una ubicación de proveedor por ID
 *     tags:
 *       - Ubicaciones Proveedores
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la ubicación
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la ubicación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Ubicacion:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *                 Direccion:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Email:
 *                   type: string
 *       404:
 *         description: Ubicación no encontrada
 *         content:
 *           application/json:
 *             example:
 *               error: Ubicación no encontrada
 */

// Obtener una ubicación de proveedor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM ubicaciones_proveedores WHERE "ID_Ubicacion" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ubicación de proveedor no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener ubicación de proveedor:', error);
        res.status(500).json({ error: 'Error al obtener ubicación de proveedor' });
    }
});


/**
 * @swagger
 * /api/ubicaciones_proveedores:
 *   post:
 *     summary: Crea una nueva ubicación de proveedor
 *     tags:
 *       - Ubicaciones Proveedores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Proveedor:
 *                 type: integer
 *               Direccion:
 *                 type: string
 *               Telefono:
 *                 type: string
 *               Email:
 *                 type: string
 *             required:
 *               - ID_Proveedor
 *               - Direccion
 *               - Telefono
 *               - Email
 *           example:
 *             ID_Proveedor: 3
 *             Direccion: "Calle 123, Colonia Centro, Ciudad C"
 *             Telefono: "555-0000"
 *             Email: "contacto@proveedorc.com"
 *     responses:
 *       201:
 *         description: Ubicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Ubicacion:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *                 Direccion:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Email:
 *                   type: string
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             example:
 *               error: "Campos obligatorios: ID_Proveedor, Direccion, Telefono, Email"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: Error al crear ubicación de proveedor
 */

// Crear una nueva ubicación de proveedor
router.post('/', async (req, res) => {
    const { ID_Proveedor, Direccion, Telefono, Email } = req.body;

    // Validar campos obligatorios
    if (!ID_Proveedor || !Direccion || !Telefono || !Email) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Proveedor, Direccion, Telefono, Email' });
    }

    try {
        const query = `
            INSERT INTO ubicaciones_proveedores ("ID_Proveedor", "Direccion", "Telefono", "Email")
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [ID_Proveedor, Direccion, Telefono, Email];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear ubicación de proveedor:', error);
        res.status(500).json({ error: 'Error al crear ubicación de proveedor' });
    }
});

/**
 * @swagger
 * /api/ubicaciones_proveedores/{id}:
 *   put:
 *     summary: Actualiza una ubicación de proveedor existente
 *     tags:
 *       - Ubicaciones Proveedores
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la ubicación a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Proveedor:
 *                 type: integer
 *               Direccion:
 *                 type: string
 *               Telefono:
 *                 type: string
 *               Email:
 *                 type: string
 *             required:
 *               - ID_Proveedor
 *               - Direccion
 *               - Telefono
 *               - Email
 *           example:
 *             ID_Proveedor: 4
 *             Direccion: "Nueva dirección actualizada"
 *             Telefono: "555-9999"
 *             Email: "actualizado@proveedor.com"
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Ubicacion:
 *                   type: integer
 *                 ID_Proveedor:
 *                   type: integer
 *                 Direccion:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Email:
 *                   type: string
 *       404:
 *         description: Ubicación no encontrada
 *         content:
 *           application/json:
 *             example:
 *               error: Ubicación no encontrada
 */

// Actualizar una ubicación de proveedor existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { ID_Proveedor, Direccion, Telefono, Email } = req.body;

    // Validar campos obligatorios
    if (!ID_Proveedor || !Direccion || !Telefono || !Email) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Proveedor, Direccion, Telefono, Email' });
    }

    try {
        const query = `
            UPDATE ubicaciones_proveedores
            SET "ID_Proveedor" = $1, "Direccion" = $2, "Telefono" = $3, "Email" = $4
            WHERE "ID_Ubicacion" = $5
            RETURNING *;
        `;
        const values = [ID_Proveedor, Direccion, Telefono, Email, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ubicación de proveedor no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar ubicación de proveedor:', error);
        res.status(500).json({ error: 'Error al actualizar ubicación de proveedor' });
    }
});

/**
 * @swagger
 * /api/ubicaciones_proveedores/{id}:
 *   delete:
 *     summary: Elimina una ubicación de proveedor
 *     tags:
 *       - Ubicaciones Proveedores
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la ubicación a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ubicación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ubicacion:
 *                   type: object
 *                   properties:
 *                     ID_Ubicacion:
 *                       type: integer
 *                     ID_Proveedor:
 *                       type: integer
 *                     Direccion:
 *                       type: string
 *                     Telefono:
 *                       type: string
 *                     Email:
 *                       type: string
 *       404:
 *         description: Ubicación no encontrada
 *         content:
 *           application/json:
 *             example:
 *               error: Ubicación no encontrada
 */

// Eliminar una ubicación de proveedor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM ubicaciones_proveedores WHERE "ID_Ubicacion" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ubicación de proveedor no encontrada' });
        }
        res.status(200).json({ message: 'Ubicación de proveedor eliminada', ubicacion: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar ubicación de proveedor:', error);
        res.status(500).json({ error: 'Error al eliminar ubicación de proveedor' });
    }
});

module.exports = router;
