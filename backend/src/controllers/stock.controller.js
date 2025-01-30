const { getPool } = require('../config/db');
const pool = getPool();

/**
 * Controlador para reasignar stock de un proyecto a otro.
 * PUT /api/stock_detallado/reasignar
 */
const reasignarStock = async (req, res) => {
  const client = await pool.connect(); // 🔹 Iniciamos la transacción
  try {
    const { idPieza, idProyectoOrigen, idProyectoDestino, cantidad, usuario } = req.body;
    console.log("🔥 Tipo de idProyectoOrigen:", typeof idProyectoOrigen, idProyectoOrigen);

    // Convertir idProyectoOrigen a número
    const proyectoOrigenNum = parseInt(idProyectoOrigen, 10);
    console.log("🔥 Después de convertir:", typeof proyectoOrigenNum, proyectoOrigenNum);

    // 1️⃣ Verificar si hay suficiente stock 'libre' en el proyecto origen
    const verificarStockQuery = `
        SELECT COALESCE(SUM(cantidad), 0) AS cantidad_disponible
        FROM stock_detallado
        WHERE id_pieza = $1
            AND (id_proyecto = $2 OR id_proyecto IS NULL)
            AND estado = 'libre'
        `;


    console.log("📌 Parámetros antes de la consulta:", { idPieza, proyectoOrigenNum });

    await client.query("BEGIN"); // 🔹 Iniciar transacción

    const { rows } = await client.query(verificarStockQuery, [idPieza, proyectoOrigenNum]);
    console.log(`🔍 Verificación de stock: idPieza=${idPieza}, idProyectoOrigen=${proyectoOrigenNum}, Disponible=${rows[0]?.cantidad_disponible}`);
    console.log(`📌 Resultado de la consulta en la API:`, rows);

    // Si no hay stock suficiente, devolver error
    if (!rows[0] || rows[0].cantidad_disponible < cantidad) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: 'Stock insuficiente para reasignar',
        disponible: rows[0]?.cantidad_disponible || 0
      });
    }

    // 2️⃣ Actualizar id_proyecto en stock_detallado
    const actualizarStockQuery = `
        UPDATE stock_detallado
        SET id_proyecto = $1
        WHERE id_stock IN (
            SELECT id_stock FROM stock_detallado
            WHERE id_pieza = $2 AND id_proyecto = $3 AND estado = 'libre'
            ORDER BY fecha_registro ASC
            LIMIT $4
        )
    `;

    // Ejecutar actualización
    await client.query(actualizarStockQuery, [idProyectoDestino, idPieza, proyectoOrigenNum, cantidad]);

    // 3️⃣ Registrar el movimiento en movimientos_piezas (📌 Con usuario registrado)
    const registrarMovimientoQuery = `
        INSERT INTO movimientos_piezas ("ID_Pieza", "id_proyecto_anterior", "id_proyecto_nuevo", "cantidad", "fecha", "tipo", "usuario")
        VALUES ($1, $2, $3, $4, NOW(), 'cambio', $5);
    `;

    // Si no envían usuario, usamos 'Sistema' por defecto
    const usuarioFinal = usuario || 'Sistema';
    await client.query(registrarMovimientoQuery, [idPieza, proyectoOrigenNum, idProyectoDestino, cantidad, usuarioFinal]);

    await client.query("COMMIT"); // ✅ Confirmamos la transacción

    console.log(`✅ Reasignación exitosa: ${cantidad} pieza(s) de ID ${idPieza} del proyecto ${proyectoOrigenNum} al ${idProyectoDestino}`);

    return res.status(200).json({
      message: 'Reasignación de stock exitosa',
      idPieza,
      idProyectoOrigen: proyectoOrigenNum,
      idProyectoDestino,
      cantidad,
      usuario: usuarioFinal
    });

  } catch (error) {
    console.error('❌ Error al reasignar stock:', error);
    await client.query("ROLLBACK"); // 🚨 Si hay error, deshacemos cambios
    return res.status(500).json({ error: 'Error interno al reasignar stock' });
  } finally {
    client.release(); // 🔹 Liberamos la conexión
  }
};

module.exports = {
  reasignarStock
};
