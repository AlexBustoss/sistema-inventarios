const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

/**
 * CRUD para Requisiciones
 */


/**
 * @swagger
 * /requisiciones:
 *   get:
 *     summary: Obtiene todas las requisiciones
 *     responses:
 *       200:
 *         description: Lista de requisiciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Requisicion:
 *                     type: integer
 *                   Fecha:
 *                     type: string
 *                     format: date
 *                   ID_Estado:
 *                     type: integer
 *                   ID_Usuario:
 *                     type: integer
 *                   Motivo:
 *                     type: string
 *                   Destino:
 *                     type: string
 *                   Notas:
 *                     type: string
 *                   Fecha_Entrega:
 *                     type: string
 *                     format: date
 *                   Nombre_Solicitante:
 *                     type: string
 *                   Puesto_Solicitante:
 *                     type: string
 *                   Firma_Solicitante:
 *                     type: string
 *                   Nombre_Aprobador:
 *                     type: string
 *                   Puesto_Aprobador:
 *                     type: string
 *                   Firma_Aprobador:
 *                     type: string
 *                   Calle_Numero:
 *                     type: string
 *                   Colonia:
 *                     type: string
 *                   Ciudad:
 *                     type: string
 *                   Estado:
 *                     type: string
 *                   Codigo_Postal:
 *                     type: string
 *                   Telefono:
 *                     type: string
 *                   Extension:
 *                     type: string
 *                   Estado_Requisicion:
 *                     type: string
 */


// Obtener todas las requisiciones
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM requisiciones');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener requisiciones:', error);
        res.status(500).json({ error: 'Error al obtener requisiciones' });
    }
});

/**
 * @swagger
 * /requisiciones/{id}:
 *   get:
 *     summary: Obtiene una requisición específica por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la requisición a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Requisición encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Requisicion:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 ID_Estado:
 *                   type: integer
 *                 ID_Usuario:
 *                   type: integer
 *                 Motivo:
 *                   type: string
 *                 Destino:
 *                   type: string
 *                 Notas:
 *                   type: string
 *                 Fecha_Entrega:
 *                   type: string
 *                   format: date
 *                 Nombre_Solicitante:
 *                   type: string
 *                 Puesto_Solicitante:
 *                   type: string
 *                 Firma_Solicitante:
 *                   type: string
 *                 Nombre_Aprobador:
 *                   type: string
 *                 Puesto_Aprobador:
 *                   type: string
 *                 Firma_Aprobador:
 *                   type: string
 *                 Calle_Numero:
 *                   type: string
 *                 Colonia:
 *                   type: string
 *                 Ciudad:
 *                   type: string
 *                 Estado:
 *                   type: string
 *                 Codigo_Postal:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Extension:
 *                   type: string
 *                 Estado_Requisicion:
 *                   type: string
 *       404:
 *         description: Requisición no encontrada
 */


// Obtener una requisición por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM requisiciones WHERE "ID_Requisicion" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener requisición:', error);
        res.status(500).json({ error: 'Error al obtener requisición' });
    }
});

/**
 * @swagger
 * /requisiciones:
 *   post:
 *     summary: Crea una nueva requisición
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Fecha:
 *                 type: string
 *                 format: date
 *               ID_Estado:
 *                 type: integer
 *               ID_Usuario:
 *                 type: integer
 *               Motivo:
 *                 type: string
 *               Destino:
 *                 type: string
 *               Notas:
 *                 type: string
 *               Fecha_Entrega:
 *                 type: string
 *                 format: date
 *               Nombre_Solicitante:
 *                 type: string
 *               Puesto_Solicitante:
 *                 type: string
 *               Firma_Solicitante:
 *                 type: string
 *               Nombre_Aprobador:
 *                 type: string
 *               Puesto_Aprobador:
 *                 type: string
 *               Firma_Aprobador:
 *                 type: string
 *               Calle_Numero:
 *                 type: string
 *               Colonia:
 *                 type: string
 *               Ciudad:
 *                 type: string
 *               Estado:
 *                 type: string
 *               Codigo_Postal:
 *                 type: string
 *               Telefono:
 *                 type: string
 *               Extension:
 *                 type: string
 *               Estado_Requisicion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Requisición creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Requisicion:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 ID_Estado:
 *                   type: integer
 *                 ID_Usuario:
 *                   type: integer
 *                 Motivo:
 *                   type: string
 *                 Destino:
 *                   type: string
 *                 Notas:
 *                   type: string
 *                 Fecha_Entrega:
 *                   type: string
 *                   format: date
 *                 Nombre_Solicitante:
 *                   type: string
 *                 Puesto_Solicitante:
 *                   type: string
 *                 Firma_Solicitante:
 *                   type: string
 *                 Nombre_Aprobador:
 *                   type: string
 *                 Puesto_Aprobador:
 *                   type: string
 *                 Firma_Aprobador:
 *                   type: string
 *                 Calle_Numero:
 *                   type: string
 *                 Colonia:
 *                   type: string
 *                 Ciudad:
 *                   type: string
 *                 Estado:
 *                   type: string
 *                 Codigo_Postal:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Extension:
 *                   type: string
 *                 Estado_Requisicion:
 *                   type: string
 */


// Crear una nueva requisición
router.post('/', async (req, res) => {
    const {
        Fecha,
        ID_Estado,
        ID_Usuario,
        Motivo,
        Destino,
        Notas,
        Fecha_Entrega,
        Nombre_Solicitante,
        Puesto_Solicitante,
        Firma_Solicitante,
        Nombre_Aprobador,
        Puesto_Aprobador,
        Firma_Aprobador,
        Calle_Numero,
        Colonia,
        Ciudad,
        Estado,
        Codigo_Postal,
        Telefono,
        Extension,
        Estado_Requisicion
    } = req.body;

    // Validar que los campos obligatorios están presentes
    if (
        !Fecha || !ID_Estado || !ID_Usuario || !Estado_Requisicion ||
        !Nombre_Solicitante || !Puesto_Solicitante
    ) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO requisiciones (
                "Fecha", "ID_Estado", "ID_Usuario", "Motivo", "Destino", "Notas",
                "Fecha_Entrega", "Nombre_Solicitante", "Puesto_Solicitante", "Firma_Solicitante",
                "Nombre_Aprobador", "Puesto_Aprobador", "Firma_Aprobador", "Calle_Numero", 
                "Colonia", "Ciudad", "Estado", "Codigo_Postal", "Telefono", 
                "Extension", "Estado_Requisicion"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING *`,
            [
                Fecha, ID_Estado, ID_Usuario, Motivo, Destino, Notas, Fecha_Entrega,
                Nombre_Solicitante, Puesto_Solicitante, Firma_Solicitante,
                Nombre_Aprobador, Puesto_Aprobador, Firma_Aprobador, Calle_Numero,
                Colonia, Ciudad, Estado, Codigo_Postal, Telefono,
                Extension, Estado_Requisicion
            ]
        );

        res.status(201).json(result.rows[0]); // Retornar la nueva requisición creada
    } catch (error) {
        console.error('Error al crear requisición:', error);
        res.status(500).json({ error: 'Error al crear requisición' });
    }
});


/**
 * @swagger
 * /requisiciones/{id}:
 *   put:
 *     summary: Actualiza una requisición existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la requisición a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Fecha:
 *                 type: string
 *                 format: date
 *               ID_Estado:
 *                 type: integer
 *               Motivo:
 *                 type: string
 *               Destino:
 *                 type: string
 *               Notas:
 *                 type: string
 *               Fecha_Entrega:
 *                 type: string
 *                 format: date
 *               Nombre_Solicitante:
 *                 type: string
 *               Puesto_Solicitante:
 *                 type: string
 *               Firma_Solicitante:
 *                 type: string
 *               Nombre_Aprobador:
 *                 type: string
 *               Puesto_Aprobador:
 *                 type: string
 *               Firma_Aprobador:
 *                 type: string
 *               Calle_Numero:
 *                 type: string
 *               Colonia:
 *                 type: string
 *               Ciudad:
 *                 type: string
 *               Estado:
 *                 type: string
 *               Codigo_Postal:
 *                 type: string
 *               Telefono:
 *                 type: string
 *               Extension:
 *                 type: string
 *               Estado_Requisicion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Requisición actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Requisicion:
 *                   type: integer
 *                 Fecha:
 *                   type: string
 *                   format: date
 *                 ID_Estado:
 *                   type: integer
 *                 Motivo:
 *                   type: string
 *                 Destino:
 *                   type: string
 *                 Notas:
 *                   type: string
 *                 Fecha_Entrega:
 *                   type: string
 *                   format: date
 *                 Nombre_Solicitante:
 *                   type: string
 *                 Puesto_Solicitante:
 *                   type: string
 *                 Firma_Solicitante:
 *                   type: string
 *                 Nombre_Aprobador:
 *                   type: string
 *                 Puesto_Aprobador:
 *                   type: string
 *                 Firma_Aprobador:
 *                   type: string
 *                 Calle_Numero:
 *                   type: string
 *                 Colonia:
 *                   type: string
 *                 Ciudad:
 *                   type: string
 *                 Estado:
 *                   type: string
 *                 Codigo_Postal:
 *                   type: string
 *                 Telefono:
 *                   type: string
 *                 Extension:
 *                   type: string
 *                 Estado_Requisicion:
 *                   type: string
 *       404:
 *         description: Requisición no encontrada
 */


// Actualizar una requisición existente
router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID de la requisición a actualizar
    const {
        Fecha,
        ID_Estado,
        Motivo,
        Destino,
        Notas,
        Fecha_Entrega,
        Nombre_Solicitante,
        Puesto_Solicitante,
        Firma_Solicitante,
        Nombre_Aprobador,
        Puesto_Aprobador,
        Firma_Aprobador,
        Calle_Numero,
        Colonia,
        Ciudad,
        Estado,
        Codigo_Postal,
        Telefono,
        Extension,
        Estado_Requisicion
    } = req.body;

    // Validar campos obligatorios
    if (!Fecha || !ID_Estado || !Nombre_Solicitante || !Puesto_Solicitante || !Estado_Requisicion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const query = `
            UPDATE requisiciones 
            SET 
                "Fecha" = $1, "ID_Estado" = $2, "Motivo" = $3, "Destino" = $4, 
                "Notas" = $5, "Fecha_Entrega" = $6, "Nombre_Solicitante" = $7, 
                "Puesto_Solicitante" = $8, "Firma_Solicitante" = $9, "Nombre_Aprobador" = $10, 
                "Puesto_Aprobador" = $11, "Firma_Aprobador" = $12, "Calle_Numero" = $13, 
                "Colonia" = $14, "Ciudad" = $15, "Estado" = $16, "Codigo_Postal" = $17, 
                "Telefono" = $18, "Extension" = $19, "Estado_Requisicion" = $20
            WHERE "ID_Requisicion" = $21
            RETURNING *;
        `;

        const values = [
            Fecha, ID_Estado, Motivo, Destino, Notas, Fecha_Entrega, Nombre_Solicitante,
            Puesto_Solicitante, Firma_Solicitante, Nombre_Aprobador, Puesto_Aprobador,
            Firma_Aprobador, Calle_Numero, Colonia, Ciudad, Estado, Codigo_Postal,
            Telefono, Extension, Estado_Requisicion, id
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }

        res.status(200).json(result.rows[0]); // Retorna la requisición actualizada
    } catch (error) {
        console.error('Error al actualizar requisición:', error);
        res.status(500).json({ error: 'Error al actualizar requisición' });
    }
});


/**
 * @swagger
 * /requisiciones/{id}:
 *   delete:
 *     summary: Elimina una requisición
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la requisición a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Requisición eliminada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requisicion:
 *                   type: object
 *                   properties:
 *                     ID_Requisicion:
 *                       type: integer
 *                     Fecha:
 *                       type: string
 *                       format: date
 *                     ID_Estado:
 *                       type: integer
 *                     Motivo:
 *                       type: string
 *                     Destino:
 *                       type: string
 *                     Notas:
 *                       type: string
 *                     Fecha_Entrega:
 *                       type: string
 *                       format: date
 *                     Estado_Requisicion:
 *                       type: string
 *       404:
 *         description: Requisición no encontrada
 */


// Eliminar una requisición existente
// Eliminar una requisición existente
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // ID de la requisición a eliminar

    try {
        // Eliminar los movimientos asociados a la requisición
        await pool.query('DELETE FROM movimientos_inventario WHERE "ID_Requisicion" = $1', [id]);

        // Eliminar los detalles asociados a la requisición
        await pool.query('DELETE FROM detalle_requisiciones WHERE "ID_Requisicion" = $1', [id]);

        // Eliminar la requisición
        const result = await pool.query('DELETE FROM requisiciones WHERE "ID_Requisicion" = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }

        res.status(200).json({ message: 'Requisición eliminada', requisicion: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar requisición:', error);
        res.status(500).json({ error: 'Error al eliminar requisición' });
    }
});




module.exports = router;
