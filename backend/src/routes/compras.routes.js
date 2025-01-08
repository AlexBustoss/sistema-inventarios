const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importar conexión a la base de datos

const pool = initPool(); // Inicializar el pool de conexión

// Registrar una nueva compra
router.post('/', async (req, res) => {
    const { n_venta, proveedor, notas, piezas } = req.body; // Usar nombres consistentes

    if (!n_venta || !proveedor || !Array.isArray(piezas) || piezas.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos: n_venta, proveedor, y piezas son obligatorios.' });
    }

    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // Insertar la compra en la tabla `compras`
        const compraQuery = `
            INSERT INTO compras (n_venta, proveedor, notas)
            VALUES ($1, $2, $3)
            ON CONFLICT (n_venta) DO NOTHING
        `;
        await client.query(compraQuery, [n_venta, proveedor, notas]);

        // Insertar los detalles de la compra en `detalle_compras`
        const detalleQuery = `
            INSERT INTO detalle_compras (n_venta, "ID_Pieza", cantidad)
            VALUES ($1, $2, $3)
        `;
        for (const pieza of piezas) {
            await client.query(detalleQuery, [n_venta, pieza.id_pieza, pieza.cantidad]);
        }

        await client.query('COMMIT');
        client.release();
        res.status(201).json({ message: 'Compra registrada correctamente' });
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).json({ error: 'Error al registrar la compra' });
    }
});

// Asociar piezas a una compra
router.post('/:n_venta/piezas', async (req, res) => {
    const { n_venta } = req.params;
    const piezas = req.body.piezas; // Array de piezas a registrar

    if (!Array.isArray(piezas) || piezas.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos una pieza para registrar' });
    }

    try {
        const queries = piezas.map((pieza) => {
            // Determinar el estado de la pieza
            const estado = pieza.id_proyecto ? 'Asignada' : 'Libre';

            const query = `
                INSERT INTO piezas ("Descripcion", "Marca", "Ubicacion", "Stock_Actual", "Stock_Minimo", id_proyecto, "n_venta", estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const values = [
                pieza.descripcion,
                pieza.marca,
                pieza.ubicacion,
                pieza.stock_actual,
                pieza.stock_minimo,
                pieza.id_proyecto || null,
                n_venta,
                estado, // Agregar el estado calculado
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
router.get('/:n_venta', async (req, res) => {
    const { n_venta } = req.params;

    try {
        const compraQuery = `
            SELECT * FROM compras WHERE n_venta = $1;
        `;
        const piezasQuery = `
            SELECT * FROM piezas WHERE n_venta = $1;
        `;

        const [compraResult, piezasResult] = await Promise.all([
            pool.query(compraQuery, [n_venta]),
            pool.query(piezasQuery, [n_venta]),
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
