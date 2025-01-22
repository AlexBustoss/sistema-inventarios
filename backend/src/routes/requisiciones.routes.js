const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db'); // Importa getPool
const pool = getPool(); // Obtén el pool inicializado



// Aceptar una requisición
router.put('/:id/aceptar', async (req, res, next) => {
    const { id } = req.params;
    try {
      const resultado = await require('../controllers/requisiciones.controller').aceptarRequisicion(id);
      res.status(200).json({ message: 'Requisición aceptada exitosamente', resultado });
    } catch (error) {
      next(error);
    }
  });

// Ruta para cancelar una requisición
router.put('/:id/cancelar', async (req, res, next) => {
    const { id } = req.params;
    try {
      const resultado = await require('../controllers/requisiciones.controller').cancelarRequisicion(id);
      res.status(200).json({ message: 'Requisición cancelada exitosamente', resultado });
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
          "estado"          -- <--- aquí guardas el estatus (Pendiente, etc.)
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
