const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

// 📊 Reporte: Stock actual por proyecto
router.get('/stock', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id_proyecto, 
                p.nombre AS nombre_proyecto, 
                s.id_pieza, 
                pi."Descripcion" AS nombre_pieza, 
                CAST(SUM(s.cantidad) AS INTEGER) AS total_cantidad
            FROM stock_detallado s
            LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
            JOIN piezas pi ON s.id_pieza = pi."ID_Pieza"
            WHERE s.estado IN ('libre', 'asignada')
            GROUP BY s.id_proyecto, p.nombre, s.id_pieza, pi."Descripcion"
            ORDER BY s.id_proyecto;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener stock:", error);
        res.status(500).json({ error: "Error al obtener stock." });
    }
});

// 📊 Reporte: Historial de movimientos de piezas
// 📊 Reporte: Historial de movimientos de piezas con filtros y paginación
router.get('/movimientos', async (req, res) => {
    try {
        const { 
            idProyecto, 
            tipo, 
            fechaInicio, 
            fechaFin, 
            usuario, 
            page = 1, 
            limit = 10 
        } = req.query;

        const offset = (page - 1) * limit;
        let filters = [];
        let values = [];
        let counter = 1;

        if (idProyecto) {
            filters.push(`(mp.id_proyecto_anterior = $${counter} OR mp.id_proyecto_nuevo = $${counter})`);
            values.push(idProyecto);
            counter++;
        }
        if (tipo) {
            filters.push(`mp.tipo = $${counter}`);
            values.push(tipo);
            counter++;
        }
        if (fechaInicio && fechaFin) {
            filters.push(`mp.fecha BETWEEN $${counter} AND $${counter + 1}`);
            values.push(fechaInicio, fechaFin);
            counter += 2;
        }
        if (usuario) {
            filters.push(`mp.usuario ILIKE $${counter}`);
            values.push(`%${usuario}%`);
            counter++;
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

        const query = `
            SELECT 
                mp.*, 
                p."Descripcion" AS nombre_pieza, 
                pr1.nombre AS proyecto_anterior, 
                pr2.nombre AS proyecto_nuevo
            FROM movimientos_piezas mp
            JOIN piezas p ON mp."ID_Pieza" = p."ID_Pieza"
            LEFT JOIN proyectos pr1 ON mp.id_proyecto_anterior = pr1.id_proyecto
            LEFT JOIN proyectos pr2 ON mp.id_proyecto_nuevo = pr2.id_proyecto
            ${whereClause}
            ORDER BY mp.fecha DESC
            LIMIT $${counter} OFFSET $${counter + 1};
        `;

        values.push(limit, offset);

        const { rows } = await pool.query(query, values);

        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener movimientos:", error);
        res.status(500).json({ error: "Error al obtener movimientos." });
    }
});


// 📊 Reporte: Piezas consumidas por proyecto
router.get('/consumidas', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id_proyecto, 
                p.nombre AS nombre_proyecto, 
                s.id_pieza, 
                pi."Descripcion" AS nombre_pieza, 
                CAST(SUM(s.cantidad) AS INTEGER) AS total_consumido
            FROM stock_detallado s
            LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
            JOIN piezas pi ON s.id_pieza = pi."ID_Pieza"
            WHERE s.estado = 'consumido'
            GROUP BY s.id_proyecto, p.nombre, s.id_pieza, pi."Descripcion"
            ORDER BY s.id_proyecto;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener piezas consumidas:", error);
        res.status(500).json({ error: "Error al obtener piezas consumidas." });
    }
});

// 📊 Reporte: Piezas liberadas de proyectos cancelados
router.get('/liberadas', async (req, res) => {
    try {
        const query = `
            SELECT 
                mp.*, 
                p."Descripcion" AS nombre_pieza
            FROM movimientos_piezas mp
            JOIN piezas p ON mp."ID_Pieza" = p."ID_Pieza"
            WHERE tipo = 'liberación'
            ORDER BY mp.fecha DESC;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener piezas liberadas:", error);
        res.status(500).json({ error: "Error al obtener piezas liberadas." });
    }
});

// 📊 Reporte: Piezas reasignadas
router.get('/reasignadas', async (req, res) => {
    try {
        const query = `
            SELECT 
                mp.*, 
                p."Descripcion" AS nombre_pieza
            FROM movimientos_piezas mp
            JOIN piezas p ON mp."ID_Pieza" = p."ID_Pieza"
            WHERE tipo = 'cambio'
            ORDER BY mp.fecha DESC;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener piezas reasignadas:", error);
        res.status(500).json({ error: "Error al obtener piezas reasignadas." });
    }
});
router.get('/resumen', async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM stock_detallado) AS totalInventario,
                (SELECT 
                    CASE 
                        WHEN COUNT(*) = 0 THEN 0 
                        ELSE (COUNT(*) FILTER (WHERE estado = 'consumido') * 100.0 / COUNT(*)) 
                    END 
                 FROM stock_detallado) AS porcentajeConsumido,
                (SELECT COUNT(*) FROM ordenes_piezas) AS totalOrdenes
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener el resumen:", error);
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
