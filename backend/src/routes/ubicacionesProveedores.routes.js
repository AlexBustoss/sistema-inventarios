const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

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

// Validar o agregar una nueva ubicación de proveedor
router.post('/validar-o-crear', async (req, res) => {
    const { nombre } = req.body;

    // Validar que el nombre esté presente
    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es obligatorio.' });
    }

    try {
        // Verificar si la ubicación ya existe
        const buscarUbicacion = `
            SELECT * FROM ubicaciones_proveedores WHERE "Direccion" = $1
        `;
        const ubicacionExistente = await pool.query(buscarUbicacion, [nombre]);

        if (ubicacionExistente.rowCount > 0) {
            // Si existe, devolver la ubicación existente
            return res.status(200).json(ubicacionExistente.rows[0]);
        }

        // Si no existe, crear la nueva ubicación
        const crearUbicacion = `
            INSERT INTO ubicaciones_proveedores ("Direccion")
            VALUES ($1)
            RETURNING *;
        `;
        const nuevaUbicacion = await pool.query(crearUbicacion, [nombre]);

        res.status(201).json(nuevaUbicacion.rows[0]);
    } catch (error) {
        console.error('Error al validar o agregar ubicación:', error);
        res.status(500).json({ error: 'Error al validar o agregar ubicación.' });
    }
});


module.exports = router;
