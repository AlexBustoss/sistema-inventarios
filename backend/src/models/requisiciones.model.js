const { getPool } = require('../config/db');
const pool = getPool();

// Obtener una requisición por ID
const obtenerPorId = async (id) => {
    const query = `
        SELECT 
            "ID_Requisicion" AS "idRequisicion",
            "estado" AS "estadoRequisicion",
            *
        FROM requisiciones
        WHERE "ID_Requisicion" = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

// Actualizar el estado de una requisición
const actualizarEstado = async (id, nuevoEstado) => {
    const query = `
        UPDATE requisiciones
        SET "estado" = $1
        WHERE "ID_Requisicion" = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nuevoEstado, id]);
    return rows[0];
};

module.exports = {
    obtenerPorId,
    actualizarEstado,
};
