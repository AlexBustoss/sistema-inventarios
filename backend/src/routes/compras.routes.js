const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importar conexión a la base de datos

const pool = initPool(); // Inicializar el pool de conexión

// ========================================
// 1) Registrar una nueva compra en "compras" y "detalle_compras"
// ========================================
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

// ========================================
// 2) Asociar stock de piezas a una compra, PERO ahora en "stock_detallado"
// ========================================
router.post('/:n_venta/piezas', async (req, res) => {
    const { n_venta } = req.params;
    const { piezas } = req.body; // Array de piezas a registrar en el inventario

    if (!Array.isArray(piezas) || piezas.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos una pieza para registrar' });
    }

    try {
        // Recorrer las piezas y armar consultas de inserción en stock_detallado
        const queries = piezas.map((pieza) => {
            // Determinar el estado de la pieza
            const estado = pieza.id_proyecto ? 'asignada' : 'libre';

            // Insertamos en stock_detallado (id_pieza, id_proyecto, cantidad, estado, etc.)
            // Ajusta las columnas según lo que en verdad manejes.
            const query = `
                INSERT INTO stock_detallado (id_pieza, id_proyecto, id_proveedor, cantidad, estado, fecha_registro)
                VALUES ($1, $2, $3, $4, $5, now())
                RETURNING *;
            `;

            // Supongamos que en "pieza" vienen: { id_pieza, id_proyecto, id_proveedor, cantidad, ... }
            const values = [
                pieza.id_pieza,
                pieza.id_proyecto || null,
                pieza.id_proveedor || null,
                pieza.cantidad || 0,
                estado
            ];

            return pool.query(query, values);
        });

        // Ejecutar todas las inserciones
        const results = await Promise.all(queries);

        // Mapear resultados
        const stockRegistrado = results.map((result) => result.rows[0]);

        // Devolver la respuesta
        res.status(201).json({
            message: `Stock registrado en "stock_detallado" para la compra ${n_venta}`,
            stock: stockRegistrado
        });
    } catch (error) {
        console.error('Error al registrar piezas para la compra en stock_detallado:', error);
        res.status(500).json({ error: 'Error al registrar piezas en stock_detallado' });
    }
});

// ========================================
// 3) Obtener todas las compras
// ========================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM compras');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las compras:', error);
        res.status(500).json({ error: 'Error al obtener las compras' });
    }
});

// ========================================
// 4) Obtener una compra específica junto con sus piezas
//    (Si deseas ver también el stock_detallado relacionado, habría que ajustarlo)
// ========================================
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
            // OJO: Este "piezas" puede que ya no tenga sentido,
            // porque ahora insertas stock en stock_detallado.
            // Podrías omitirlo o mantenerlo si lo usas como "catálogo" o algo similar.
            piezas: piezasResult.rows,
        });
    } catch (error) {
        console.error('Error al obtener la compra:', error);
        res.status(500).json({ error: 'Error al obtener la compra' });
    }
});

module.exports = router;
