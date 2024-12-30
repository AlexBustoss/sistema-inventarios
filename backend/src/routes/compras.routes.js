const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importar conexión a la base de datos

const pool = initPool(); // Inicializar el pool de conexión

// Registrar una nueva compra
router.post('/', async (req, res) => {
    const { Proveedor, Notas } = req.body;

    // Validación básica
    if (!Proveedor && !Notas) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para registrar la compra' });
    }

    try {
        const query = `
            INSERT INTO compras ("proveedor", "notas")
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [Proveedor || null, Notas || null];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); // Devuelve la compra creada
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).json({ error: 'Error al registrar la compra' });
    }
});

// Asociar piezas a una compra
router.post('/:nVenta/piezas', async (req, res) => {
    const { nVenta } = req.params;
    const piezas = req.body.piezas; // Array de piezas a registrar

    if (!Array.isArray(piezas) || piezas.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos una pieza para registrar' });
    }

    try {
        const queries = piezas.map((pieza) => {
            const query = `
                INSERT INTO piezas ("Descripcion", "Marca", "Ubicacion", "Stock_Actual", "Stock_Minimo", id_proyecto, "N_Venta")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const values = [
                pieza.Descripcion,
                pieza.Marca,
                pieza.Ubicacion,
                pieza.Stock_Actual,
                pieza.Stock_Minimo,
                pieza.id_proyecto || null,
                nVenta,
            ];
            return pool.query(query, values);
        });

        const results = await Promise.all(queries);
        const piezasRegistradas = results.map((result) => result.rows[0]);

        res.status(201).json(piezasRegistradas);
    } catch (error) {
        console.error('Error al registrar piezas para la compra:', error);
        res.status(500).json({ error: 'Error al registrar piezas para la compra' });
    }
});

// Obtener todas las compras
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM compras');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las compras:', error);
        res.status(500).json({ error: 'Error al obtener las compras' });
    }
});

// Obtener una compra específica junto con sus piezas
router.get('/:nVenta', async (req, res) => {
    const { nVenta } = req.params;

    try {
        const compraQuery = `
            SELECT * FROM compras WHERE "N_Venta" = $1;
        `;
        const piezasQuery = `
            SELECT * FROM piezas WHERE "N_Venta" = $1;
        `;

        const [compraResult, piezasResult] = await Promise.all([
            pool.query(compraQuery, [nVenta]),
            pool.query(piezasQuery, [nVenta]),
        ]);

        if (compraResult.rowCount === 0) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        res.status(200).json({
            compra: compraResult.rows[0],
            piezas: piezasResult.rows,
        });
    } catch (error) {
        console.error('Error al obtener la compra:', error);
        res.status(500).json({ error: 'Error al obtener la compra' });
    }
});

module.exports = router;
