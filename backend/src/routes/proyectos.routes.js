const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

// 📌 Obtener lista de proyectos
router.get('/', async (req, res) => {
    try {
        const query = `SELECT id_proyecto, nombre FROM proyectos ORDER BY nombre`;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener proyectos:", error);
        res.status(500).json({ error: "Error al obtener proyectos." });
    }
});

module.exports = router;
