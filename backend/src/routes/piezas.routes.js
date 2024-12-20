const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importar initPool desde db.js

const pool = initPool(); // Inicializar el pool aquí

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

// Obtener piezas con bajo stock
router.get('/bajo-stock', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * 
            FROM piezas
            WHERE "Stock_Actual" < "Stock_Minimo"
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener piezas con bajo stock:', error);
        res.status(500).json({ error: 'Error al obtener piezas con bajo stock' });
    }
});

// Obtener una pieza por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Validar que el id sea numérico
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El ID debe ser un número' });
        }

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

// Crear una nueva pieza
router.post('/', async (req, res) => {
    const { Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado } = req.body;

    // Validar campos obligatorios
    if (!Descripcion || !Marca || !Ubicacion || Stock_Actual === undefined || Stock_Minimo === undefined || !ID_Orden || !id_proyecto || !estado) {
        return res.status(400).json({ error: 'Campos obligatorios: Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado' });
    }

    try {
        const query = `
            INSERT INTO piezas ("Descripcion", "Marca", "Ubicacion", "Stock_Actual", "Stock_Minimo", "ID_Orden", "id_proyecto", "estado")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear pieza:', error);
        res.status(500).json({ error: 'Error al crear pieza' });
    }
});

// Actualizar una pieza existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado } = req.body;

    // Validar campos obligatorios
    if (!Descripcion || !Marca || !Ubicacion || Stock_Actual === undefined || Stock_Minimo === undefined || !ID_Orden || !id_proyecto || !estado) {
        return res.status(400).json({ error: 'Campos obligatorios: Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado' });
    }

    try {
        const query = `
            UPDATE piezas
            SET "Descripcion" = $1, "Marca" = $2, "Ubicacion" = $3, "Stock_Actual" = $4, "Stock_Minimo" = $5, "ID_Orden" = $6, "id_proyecto" = $7, "estado" = $8
            WHERE "ID_Pieza" = $9
            RETURNING *;
        `;
        const values = [Descripcion, Marca, Ubicacion, Stock_Actual, Stock_Minimo, ID_Orden, id_proyecto, estado, id];
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
