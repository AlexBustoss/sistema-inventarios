const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db'); // Importa getPool
const pool = getPool(); // Obtén el pool inicializado
const { aceptarRequisicion, cancelarRequisicion } = require('../controllers/requisiciones.controller');
const RequisicionesController = require('../controllers/requisiciones.controller');


// Aceptar una requisición
router.put('/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await aceptarRequisicion(id);
    res.status(200).json({ message: 'Requisición aceptada con éxito', resultado });
  } catch (error) {
    console.error("❌ Error al aceptar requisición:", error.message);
    res.status(400).json({ error: error.message });
  }
});

  // ============================
  // Aceptar una requisición (lógica directamente en la ruta)
  // ============================
  router.put('/aceptar/:idRequisicion', async (req, res) => {
    const { idRequisicion } = req.params;

    try {
        // 1️⃣ Verificar disponibilidad de stock
        const verificarStockQuery = `
            SELECT dr."ID_Pieza", dr."Cantidad_Solicitada", 
                  COALESCE(SUM(sd.cantidad), 0) AS stock_asignado
            FROM detalle_requisiciones dr
            LEFT JOIN stock_detallado sd 
                ON dr."ID_Pieza" = sd.id_pieza 
                AND dr.id_proyecto = sd.id_proyecto 
                AND sd.estado = 'asignada'
            WHERE dr."ID_Requisicion" = $1
            GROUP BY dr."ID_Pieza", dr."Cantidad_Solicitada";
        `;

        const stockCheck = await pool.query(verificarStockQuery, [idRequisicion]);

        // 2️⃣ Revisar si hay piezas con stock insuficiente
        const piezasFaltantes = stockCheck.rows.filter(pieza => pieza.stock_asignado < pieza.Cantidad_Solicitada);

        if (piezasFaltantes.length > 0) {
            console.log("⚠️ Stock insuficiente para aceptar la requisición:", piezasFaltantes);
            return res.status(400).json({
                error: 'Stock insuficiente para aceptar la requisición.',
                piezasFaltantes
            });
        }

        // 3️⃣ Si todas las piezas tienen stock suficiente, actualizar la requisición a "Aceptada"
        const actualizarRequisicionQuery = `
            UPDATE requisiciones 
            SET estado = 'Aceptada' 
            WHERE "ID_Requisicion" = $1;
        `;
        await pool.query(actualizarRequisicionQuery, [idRequisicion]);

        // 4️⃣ Cambiar el estado de las piezas en stock_detallado a "consumido"
        const consumirStockQuery = `
            UPDATE stock_detallado
            SET estado = 'consumido'
            WHERE id_pieza IN (
                SELECT "ID_Pieza" FROM detalle_requisiciones WHERE "ID_Requisicion" = $1
            ) 
            AND id_proyecto = (SELECT id_proyecto FROM requisiciones WHERE "ID_Requisicion" = $1)
            AND estado = 'asignada';
        `;

        await pool.query(consumirStockQuery, [idRequisicion]);

        console.log("✅ Requisición aceptada y stock actualizado:", idRequisicion);
        res.status(200).json({ message: "Requisición aceptada con éxito." });

    } catch (error) {
        console.error("❌ Error al aceptar requisición:", error);
        res.status(500).json({ error: 'Error al aceptar requisición.' });
    }
  });

// Ruta para cancelar una requisición
router.put('/:id/cancelar', async (req, res, next) => {
  try {
    // Pasamos req, res (y next si lo necesitas)
    await RequisicionesController.cancelarRequisicion(req, res, next);
  } catch (error) {
    next(error);
  }
});


// Obtener todas las requisiciones, ordenadas por fecha descendente
router.get('/', async (req, res) => {
    try {
        // Consulta SQL para obtener requisiciones ordenadas por fecha más reciente
        const result = await pool.query('SELECT * FROM requisiciones ORDER BY "Fecha" DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener requisiciones:', error);
        res.status(500).json({ error: 'Error al obtener requisiciones' });
    }
});


// Obtener una requisición por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM requisiciones WHERE "ID_Requisicion" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener requisición:', error);
        res.status(500).json({ error: 'Error al obtener requisición' });
    }
});



// Crear una nueva requisición
// Dentro de requisiciones.routes.js, en la ruta POST '/'
router.post('/', async (req, res) => {
    console.log("🔹 Datos recibidos en el backend:", JSON.stringify(req.body, null, 2)); // 🛠 LOG 1

    const {
      Fecha,
      ID_Estado,         // (FK a tabla estados_requisicion)
      ID_Usuario,        // (FK a usuarios) 
      Departamento,
      Destino,
      Notas,
      Fecha_Entrega,
      Nombre_Solicitante,
      Puesto_Solicitante,
      Firma_Solicitante,
      Nombre_Aprobador,
      Puesto_Aprobador,
      Firma_Aprobador,
      Calle_Numero,
      Colonia,
      Ciudad,
      Estado,          // <- Ojo: Este es el "estado" del domicilio, no el estatus de la requisición
      Telefono,
      Extension,
      // Estas dos columnas son nuevas:
      id_proyecto,
      No_Requisicion,
      // El estatus real de la requisición:
      estado // <-- 'Pendiente', 'Activa', 'Cancelada', etc.
    } = req.body;
  
    // Ejemplo de validaciones mínimas
    if (!Fecha || !Nombre_Solicitante || !Puesto_Solicitante) {
        console.error("Faltan campos obligatorios:", { Fecha, Nombre_Solicitante, Puesto_Solicitante }); // 🛠 LOG 2

      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    try {
      // 🔹 Verificar si el id_proyecto existe en la tabla proyectos antes de insertar la requisición
      const queryProyecto = `SELECT COUNT(*) FROM proyectos WHERE id_proyecto = $1;`;
      const proyectoExiste = await pool.query(queryProyecto, [id_proyecto]);

      if (proyectoExiste.rows[0].count == 0) {
        return res.status(400).json({ error: 'El id_proyecto no existe en la base de datos.' });
      }
      // Ajusta las columnas y el orden de VALUES para que coincidan EXACTO con tu tabla "requisiciones"
      const query = `
        INSERT INTO requisiciones (
          "Fecha",
          "ID_Estado",
          "ID_Usuario",
          "Departamento",
          "Destino",
          "Notas",
          "Fecha_Entrega",
          "Nombre_Solicitante",
          "Puesto_Solicitante",
          "Firma_Solicitante",
          "Nombre_Aprobador",
          "Puesto_Aprobador",
          "Firma_Aprobador",
          "Calle_Numero",
          "Colonia",
          "Ciudad",
          "Estado",         -- es la columna address-state, NO el estatus
          "Telefono",
          "Extension",
          "id_proyecto",
          "No_Requisicion",
          "estado"
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
               $11, $12, $13, $14, $15, $16, $17, $18, $19,
               $20, $21, $22)
        RETURNING *;
      `;
  
      const values = [
        Fecha,
        ID_Estado || null,
        ID_Usuario || null,
        Departamento || null,
        Destino || null,
        Notas || null,
        Fecha_Entrega || null,
        Nombre_Solicitante,
        Puesto_Solicitante,
        Firma_Solicitante || null,
        Nombre_Aprobador || null,
        Puesto_Aprobador || null,
        Firma_Aprobador || null,
        Calle_Numero || null,
        Colonia || null,
        Ciudad || null,
        Estado || null,            // address field
        Telefono || null,
        Extension || null,
        id_proyecto,               // not null if tu tabla lo exige
        No_Requisicion || null,
        estado || 'Pendiente'      // o 'Activa', según tu default
      ];
      console.log("Ejecutando consulta con valores:", values); // LOG 3

  
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear requisición:', error);
      res.status(500).json({ error: 'Error al crear requisición' });
    }
  });
  



// Actualizar una requisición existente
router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID de la requisición a actualizar
    const {
        Fecha,
        ID_Estado,
        Departamento,
        Destino,
        Notas,
        Fecha_Entrega,
        Nombre_Solicitante,
        Puesto_Solicitante,
        Firma_Solicitante,
        Nombre_Aprobador,
        Puesto_Aprobador,
        Firma_Aprobador,
        Calle_Numero,
        Colonia,
        Ciudad,
        Estado,
        Telefono,
        Extension,
        estado
    } = req.body;

    // Validar campos obligatorios
    if (!Fecha || !ID_Estado || !Nombre_Solicitante || !Puesto_Solicitante || !estado) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const query = `
            UPDATE requisiciones 
            SET 
                "Fecha" = $1, "ID_Estado" = $2, "Departamento" = $3, "Destino" = $4, 
                "Notas" = $5, "Fecha_Entrega" = $6, "Nombre_Solicitante" = $7, 
                "Puesto_Solicitante" = $8, "Firma_Solicitante" = $9, "Nombre_Aprobador" = $10, 
                "Puesto_Aprobador" = $11, "Firma_Aprobador" = $12, "Calle_Numero" = $13, 
                "Colonia" = $14, "Ciudad" = $15, "Estado" = $16, "Telefono" = $17, "Extension" = $18, "estado" = $19
            WHERE "ID_Requisicion" = $20
            RETURNING *;
        `;

        const values = [
            Fecha, ID_Estado, Departamento, Destino, Notas, Fecha_Entrega, Nombre_Solicitante,
            Puesto_Solicitante, Firma_Solicitante, Nombre_Aprobador, Puesto_Aprobador,
            Firma_Aprobador, Calle_Numero, Colonia, Ciudad, Estado,
            Telefono, Extension, estado, id
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }

        res.status(200).json(result.rows[0]); // Retorna la requisición actualizada
    } catch (error) {
        console.error('Error al actualizar requisición:', error);
        res.status(500).json({ error: 'Error al actualizar requisición' });
    }
});



// Eliminar una requisición existente
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // ID de la requisición a eliminar

    try {
        // Eliminar los movimientos asociados a la requisición
        await pool.query('DELETE FROM movimientos_inventario WHERE "ID_Requisicion" = $1', [id]);

        // Eliminar los detalles asociados a la requisición
        await pool.query('DELETE FROM detalle_requisiciones WHERE "ID_Requisicion" = $1', [id]);

        // Eliminar la requisición
        const result = await pool.query('DELETE FROM requisiciones WHERE "ID_Requisicion" = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }

        res.status(200).json({ message: 'Requisición eliminada', requisicion: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar requisición:', error);
        res.status(500).json({ error: 'Error al eliminar requisición' });
    }
});






module.exports = router;
