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

// Obtener piezas con bajo stock, ordenadas por Stock_Actual
router.get('/bajo-stock', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * 
            FROM piezas 
            WHERE "Stock_Actual" < "Stock_Minimo" 
            ORDER BY "Stock_Actual" ASC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener piezas con bajo stock:', error);
        res.status(500).json({ error: 'Error al obtener piezas con bajo stock' });
    }
});

// Buscar piezas similares (NUEVA RUTA)
router.get('/similares', async (req, res) => {
    const { noParte, descripcion, marca } = req.query;
  
    try {
        const query = `
        SELECT * 
        FROM piezas
        WHERE 
          ($1::TEXT IS NULL OR "ID_Pieza"::TEXT = $1) AND -- Coincidencia exacta para noParte
          ($2::TEXT IS NULL OR "Descripcion" ILIKE $2) AND
          ($3::TEXT IS NULL OR "Marca" ILIKE $3)
      `;
      
      const values = [
        noParte ? noParte : null, // Coincidencia exacta para noParte
        descripcion ? `%${descripcion}%` : null,
        marca ? `%${marca}%` : null,
      ];
  
      console.log("Valores enviados a la consulta:", values);
      const result = await pool.query(query, values);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error en la consulta de piezas similares:', error);
      res.status(500).json({ error: 'Error al buscar piezas similares' });
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

// Asociar piezas a una compra
router.post('/asociar-compra/:n_venta', async (req, res) => {
    const { n_venta } = req.params;
    const { piezas } = req.body;

    if (!Array.isArray(piezas) || piezas.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar un array de piezas.' });
    }

    const client = await pool.connect(); // Para manejar la transacción
    try {
        await client.query('BEGIN'); // Inicia la transacción

        for (const pieza of piezas) {
            const { noParte, cantidad } = pieza;

            if (!noParte || !cantidad) {
                throw new Error('Cada pieza debe tener "noParte" y "cantidad".');
            }

            // Actualizar el stock y asociar la pieza al número de venta
            const query = `
                UPDATE piezas
                SET "Stock_Actual" = "Stock_Actual" + $1,
                    "ID_Orden" = $2
                WHERE "ID_Pieza" = $3
                RETURNING *;
            `;

            const values = [cantidad, n_venta, noParte];

            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                throw new Error(`La pieza con ID_Pieza ${noParte} no existe.`);
            }
        }

        await client.query('COMMIT'); // Confirma la transacción
        res.status(200).json({ mensaje: 'Piezas asociadas exitosamente a la compra.' });
    } catch (error) {
        await client.query('ROLLBACK'); // Revierte la transacción en caso de error
        console.error('Error al asociar piezas a la compra:', error);
        res.status(500).json({ error: 'Error al asociar piezas a la compra.' });
    } finally {
        client.release(); // Libera el cliente
    }
});

// Asignar stock a un proyecto
router.post('/asignar-stock', async (req, res) => {
    const { id_pieza, id_proyecto, cantidad } = req.body;

    console.log("Datos recibidos:", { id_pieza, id_proyecto, cantidad });

    if (!id_pieza || !id_proyecto || !cantidad) {
        return res.status(400).json({ error: 'Campos obligatorios: id_pieza, id_proyecto, cantidad.' });
    }

    try {
        const query = 'SELECT asignar_stock_a_proyecto($1, $2, $3)';
        const values = [id_pieza, id_proyecto, cantidad];
        await pool.query(query, values);

        res.status(200).json({ message: 'Stock asignado exitosamente al proyecto.' });
    } catch (error) {
        console.error('Error al asignar stock:', error);
        res.status(500).json({ error: 'Error al asignar stock al proyecto.' });
    }
});

// Liberar stock de un proyecto
router.post('/liberar-stock', async (req, res) => {
    const { id_pieza, id_proyecto, cantidad } = req.body;

    if (!id_pieza || !id_proyecto || !cantidad) {
        return res.status(400).json({ error: 'Campos obligatorios: id_pieza, id_proyecto, cantidad.' });
    }

    try {
        const query = 'SELECT liberar_stock_de_proyecto($1, $2, $3)';
        const values = [id_pieza, id_proyecto, cantidad];
        await pool.query(query, values);

        res.status(200).json({ message: 'Stock liberado exitosamente del proyecto.' });
    } catch (error) {
        console.error('Error al liberar stock:', error);
        res.status(500).json({ error: 'Error al liberar stock del proyecto.' });
    }
});


module.exports = router;
