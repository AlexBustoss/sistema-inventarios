const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importar conexión a DB
const StockController = require('../controllers/stock.controller');

const pool = initPool(); // Inicializar conexión

// Ruta: Agregar stock detallado
// Registrar stock detallado (POST /api/stock-detallado)
router.post('/', async (req, res) => {
    const { idPieza, cantidad, idProveedor, idProyecto, estado } = req.body;

    // Validar campos obligatorios
    if (!idPieza || !cantidad || !idProveedor) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: idPieza, cantidad, idProveedor.' });
    }

    try {
        const query = `
            INSERT INTO stock_detallado (id_pieza, id_proveedor, id_proyecto, cantidad, estado, fecha_registro)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const values = [
            idPieza,
            idProveedor,
            idProyecto || null,
            cantidad,
            estado || 'Libre',
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); // Responder con el registro creado
    } catch (error) {
        console.error('Error al registrar stock detallado:', error);
        res.status(500).json({ error: 'Error al registrar stock detallado.' });
    }
});

// Ruta: Consultar stock por ID de proyecto
router.get('/proyecto/:idProyecto', async (req, res) => {
    const { idProyecto } = req.params;

    try {
        const query = `
            SELECT * FROM stock_detallado
            WHERE id_proyecto = $1;
        `;
        const result = await pool.query(query, [idProyecto]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar stock por proyecto:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar el stock por proyecto.' });
    }
});

// Ruta: Consultar stock por ID de pieza
router.get('/pieza/:idPieza', async (req, res) => {
    const { idPieza } = req.params;

    try {
        const query = `
            SELECT * FROM stock_detallado
            WHERE id_pieza = $1;
        `;
        const result = await pool.query(query, [idPieza]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar stock por pieza:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar el stock por pieza.' });
    }
});

// Ruta: Consultar todo el stock detallado
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT * FROM stock_detallado;
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar todo el stock detallado:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar el stock detallado.' });
    }
});

router.put('/reasignar', StockController.reasignarStock);


module.exports = router;
