const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

// 📊 Reporte: Stock actual por proyecto
router.get('/stock', async (req, res) => {
    try {
        const query = `
            SELECT id_proyecto, id_pieza, SUM(cantidad) AS total_cantidad
            FROM stock_detallado
            WHERE estado = 'libre' OR estado = 'asignada'
            GROUP BY id_proyecto, id_pieza
            ORDER BY id_proyecto;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener stock:", error);
        res.status(500).json({ error: "Error al obtener stock." });
    }
});

// 📊 Reporte: Historial de movimientos de piezas
router.get('/movimientos', async (req, res) => {
    try {
        const query = `
            SELECT mp.*, p."Descripcion" AS nombre_pieza
            FROM movimientos_piezas mp
            JOIN piezas p ON mp."ID_Pieza" = p."ID_Pieza"
            ORDER BY mp.fecha DESC;
        `;
        const { rows } = await pool.query(query);
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
            SELECT id_proyecto, id_pieza, SUM(cantidad) AS total_consumido
            FROM stock_detallado
            WHERE estado = 'consumido'
            GROUP BY id_proyecto, id_pieza
            ORDER BY id_proyecto;
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
            SELECT mp.*, p."Descripcion" AS nombre_pieza
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
            SELECT mp.*, p."Descripcion" AS nombre_pieza
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

module.exports = router;
