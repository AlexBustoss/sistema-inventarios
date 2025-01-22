const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db');

const pool = initPool(); // Inicializar pool

//------------------------------------------------------
// 1. Obtener todas las piezas (CATÁLOGO)
//    Sin Stock_Actual, Stock_Minimo, Ubicacion, etc.
//------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Asumiendo que tu tabla "piezas" ahora solo tiene:
    // "ID_Pieza", "Descripcion", "Marca", "n_venta", "estado" (si acaso lo mantienes)
    // Quita o añade campos según lo que hayas dejado en la tabla.
    const result = await pool.query(`
      SELECT "ID_Pieza", "Descripcion", "Marca", "n_venta", "estado"
      FROM piezas
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener piezas:', error);
    res.status(500).json({ error: 'Error al obtener piezas' });
  }
});

// Ej: GET /api/piezas/with-stock
// Retorna { ID_Pieza, Descripcion, Marca, stockLibre }
router.get('/with-stock', async (req, res) => {
    //console.log("Entró a /with-stock sin problemas");

    try {
      const query = `
        SELECT p."ID_Pieza",
               p."Descripcion",
               p."Marca",
               COALESCE(SUM(s.cantidad), 0) AS "stockLibre"
        FROM piezas p
        LEFT JOIN stock_detallado s
          ON s.id_pieza = p."ID_Pieza"
          AND s.estado = 'libre'
        GROUP BY p."ID_Pieza"
        ORDER BY p."ID_Pieza";
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener piezas con stock:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

//------------------------------------------------------
// 2. (OPCIONAL) Endpoint de piezas con "bajo stock" - AHORA EN stock_detallado
//    Si quieres eliminarlo completamente, hazlo.
//    Si deseas mantenerlo, calcula el "bajo stock" desde stock_detallado.
//    Aquí un ejemplo de cómo podrías hacerlo:
//------------------------------------------------------
router.get('/bajo-stock', async (req, res) => {
  try {
    // Por ejemplo, sumando la cantidad libre en stock_detallado y comparando con algún umbral.
    // Esto es solo un EJEMPLO; ajusta según tu lógica.
    const query = `
      SELECT p."ID_Pieza", p."Descripcion", p."Marca",
             COALESCE(SUM(s.cantidad), 0) AS stock_libre
      FROM piezas p
      LEFT JOIN stock_detallado s
        ON s.id_pieza = p."ID_Pieza" AND s.estado = 'libre'
      GROUP BY p."ID_Pieza"
      HAVING COALESCE(SUM(s.cantidad), 0) < 10  -- Ejemplo: si < 10 se considera bajo
      ORDER BY COALESCE(SUM(s.cantidad), 0) ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener piezas con bajo stock:', error);
    res.status(500).json({ error: 'Error al obtener piezas con bajo stock' });
  }
});

//------------------------------------------------------
// 3. Buscar piezas similares
//    Ya no buscamos Stock_Actual ni Ubicacion
//------------------------------------------------------
// Ruta existente:
router.get('/similares', async (req, res) => {
  const { ID_Pieza, descripcion, marca, q } = req.query;

  try {
    if (q) {
      // Si hay `q`, filtrar por `Marca` o `Descripcion`
      const sql = `
        SELECT "ID_Pieza", "Descripcion", "Marca", "n_venta", "estado"
        FROM piezas
        WHERE "Marca" ILIKE $1 OR "Descripcion" ILIKE $1
        LIMIT 20;
      `;
      const filter = `%${q}%`;
      const result = await pool.query(sql, [filter]);
      return res.status(200).json(result.rows);
    }

    // Lógica original para búsquedas específicas (sin q)
    const query = `
      SELECT "ID_Pieza", "Descripcion", "Marca", "n_venta", "estado"
      FROM piezas
      WHERE ($1::TEXT IS NULL OR "ID_Pieza"::TEXT = $1)
        AND ($2::TEXT IS NULL OR "Descripcion" ILIKE $2)
        AND ($3::TEXT IS NULL OR "Marca" ILIKE $3)
    `;
    const values = [
      ID_Pieza || null,
      descripcion ? `%${descripcion}%` : null,
      marca ? `%${marca}%` : null
    ];
    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error en la consulta de piezas similares:', error);
    res.status(500).json({ error: 'Error al buscar piezas similares' });
  }
});



//------------------------------------------------------
// 4. Obtener una pieza por ID
//    Sólo devolvemos campos relevantes (catálogo).
//------------------------------------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser un número' });
    }

    const result = await pool.query(`
      SELECT "ID_Pieza", "Descripcion", "Marca", "n_venta", "estado"
      FROM piezas
      WHERE "ID_Pieza" = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener pieza:', error);
    res.status(500).json({ error: 'Error al obtener pieza' });
  }
});

//------------------------------------------------------
// 5. Ruta POST /registrar-paquete
//    Al final de tu archivo, ya tienes una versión que inserta en stock_detallado.
//    Si esa funciona bien, podemos dejarla tal cual.
//    Verifica que no haga "INSERT INTO piezas(...)" con Stock_Actual, etc.
//------------------------------------------------------

// (Ya existe en tu código: router.post('/registrar-paquete', ...))
// Revisar si esa es la versión final que se apoya en stock_detallado. 
// Si ya la tienes, la dejamos. O actualízala como en tu snippet actual.


//------------------------------------------------------
// 6. PUT /api/piezas/:id => Vamos a eliminar la lógica de Stock_Actual, Ubicacion, etc.
//    O, si quieres mantener un update "básico" sólo de Descripcion, Marca, etc., lo simplificamos
//------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { Descripcion, Marca, estado } = req.body;

  // Validar campos obligatorios
  if (!Descripcion || !Marca) {
    return res.status(400).json({ error: 'Campos obligatorios: Descripcion, Marca.' });
  }

  // 'estado' es opcional, si la tabla "piezas" lo sigue teniendo.
  // Quita o deja según tu caso.
  const nuevoEstado = estado || 'libre'; 

  try {
    // Ajustar al nuevo esquema de tu tabla "piezas"
    const query = `
      UPDATE piezas
      SET "Descripcion" = $1,
          "Marca" = $2,
          "estado" = $3
      WHERE "ID_Pieza" = $4
      RETURNING *;
    `;
    const values = [Descripcion, Marca, nuevoEstado, id];

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

//------------------------------------------------------
// 7. DELETE /api/piezas/:id => Esto puede quedarse igual
//------------------------------------------------------
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

//------------------------------------------------------
// 8. POST /asociar-compra/:n_venta => se usaba para "Stock_Actual" en piezas
//    Si ya no usas eso, bórralo o cambialo para stock_detallado
//------------------------------------------------------
router.post('/asociar-compra/:n_venta', async (req, res) => {
  const { n_venta } = req.params;
  const { piezas } = req.body;

  // Tal vez ya no necesites esto, porque "detalle_compras" y "stock_detallado" 
  // lo manejas en "compras.routes.js".
  // Elimínalo si ya no hace falta.
  return res.status(410).json({
    error: 'Esta ruta ya no está en uso. Ahora manejamos el stock en stock_detallado.'
  });
});

//------------------------------------------------------
// 9. POST /asignar-stock y /liberar-stock => llaman a funciones PL/pgSQL
//    que usan stock_detallado en su interior. 
//    Si esas funciones están correctas, no hay problema. 
//    De lo contrario, revísalas para que NO actualicen "Stock_Actual" en piezas.
//------------------------------------------------------
router.post('/asignar-stock', async (req, res) => {
  const { id_pieza, id_proyecto, cantidad } = req.body;

  if (!id_pieza || !id_proyecto || !cantidad) {
    return res.status(400).json({ error: 'Campos obligatorios: id_pieza, id_proyecto, cantidad.' });
  }

  try {
    // Asegúrate de que la función asignar_stock_a_proyecto 
    // trabaje sobre stock_detallado en vez de la tabla piezas.
    const query = 'SELECT asignar_stock_a_proyecto($1, $2, $3)';
    const values = [id_pieza, id_proyecto, cantidad];
    await pool.query(query, values);

    res.status(200).json({ message: 'Stock asignado exitosamente al proyecto.' });
  } catch (error) {
    console.error('Error al asignar stock:', error);
    res.status(500).json({ error: 'Error al asignar stock al proyecto.' });
  }
});

router.post('/liberar-stock', async (req, res) => {
  const { id_pieza, id_proyecto, cantidad } = req.body;

  if (!id_pieza || !id_proyecto || !cantidad) {
    return res.status(400).json({ error: 'Campos obligatorios: id_pieza, id_proyecto, cantidad.' });
  }

  try {
    // Asegúrate de que liberar_stock_de_proyecto() use stock_detallado.
    const query = 'SELECT liberar_stock_de_proyecto($1, $2, $3)';
    const values = [id_pieza, id_proyecto, cantidad];
    await pool.query(query, values);

    res.status(200).json({ message: 'Stock liberado exitosamente del proyecto.' });
  } catch (error) {
    console.error('Error al liberar stock:', error);
    res.status(500).json({ error: 'Error al liberar stock del proyecto.' });
  }
});

//------------------------------------------------------
// 10. POST /registrar-paquete => la versión final que insertas en stock_detallado
//     Si la que aparece al final ya sirve, déjala.
//------------------------------------------------------
router.post('/registrar-paquete', async (req, res) => {
  const { proveedor, notas, piezas } = req.body;

  if (!proveedor || !Array.isArray(piezas) || piezas.length === 0) {
    return res.status(400).json({ error: 'Debe proporcionar un proveedor y al menos una pieza.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const pieza of piezas) {
      const { id_pieza, cantidad, id_proyecto } = pieza;

      if (!id_pieza || !cantidad) {
        throw new Error('Cada pieza debe tener un id_pieza y cantidad.');
      }

      // Insertar en la tabla stock_detallado
      const estado = id_proyecto ? 'asignada' : 'libre';
      const query = `
        INSERT INTO stock_detallado (id_pieza, id_proveedor, cantidad, estado, fecha_registro, id_proyecto)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `;
      const values = [id_pieza, proveedor, cantidad, estado, id_proyecto || null];
      await client.query(query, values);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Paquete registrado exitosamente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar el paquete:', error);
    res.status(500).json({ error: 'Error al registrar el paquete.' });
  } finally {
    client.release();
  }
});

//------------------------------------------------------
// 11. POST / => Crear pieza en "piezas" (catálogo)
//    Sin Stock_Actual ni Ubicacion ni Stock_Minimo
//------------------------------------------------------
router.post('/', async (req, res) => {
  const { descripcion, marca } = req.body;

  if (!descripcion || !marca) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: descripcion, marca.'
    });
  }

  try {
    const query = `
      INSERT INTO piezas ("Descripcion", "Marca")
      VALUES ($1, $2)
      RETURNING "ID_Pieza", "Descripcion", "Marca"
    `;
    const values = [descripcion, marca];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar pieza:', error);
    res.status(500).json({
      error: 'Error al agregar pieza. Detalles: ' + error.message
    });
  }
});

//------------------------------------------------------
// 12. POST /validar-o-crear => Si ya no lo usas, puedes eliminarlo,
//     o dejarlo como un create básico sin Ubicacion, etc.
//------------------------------------------------------
router.post('/validar-o-crear', async (req, res) => {
  const { descripcion, marca } = req.body;

  try {
    const queryInsertar = `
      INSERT INTO piezas ("Descripcion", "Marca")
      VALUES ($1, $2)
      RETURNING "ID_Pieza";
    `;
    const valoresInsertar = [descripcion, marca];
    const resultadoInsertar = await pool.query(queryInsertar, valoresInsertar);

    res.status(201).json({ idPieza: resultadoInsertar.rows[0].ID_Pieza });
  } catch (error) {
    console.error('Error al validar o crear la pieza:', error);
    res.status(500).json({ error: 'Hubo un problema al validar o crear la pieza.' });
  }
});

//------------------------------------------------------
// 13. POST /crear-con-stock => Similar caso, reescribir para que NO
//     inserte Stock_Actual en "piezas". Lo dejé como ejemplo
//     que crea una pieza y luego inserta el stock en stock_detallado.
//------------------------------------------------------
router.post('/crear-con-stock', async (req, res) => {
  const {
    descripcion, marca, cantidad,
    proveedor, estado, n_venta, idProyecto
  } = req.body;

  if (!descripcion || !marca || !cantidad || !proveedor) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: descripcion, marca, cantidad, proveedor.'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Crear pieza en "piezas" (catálogo)
    const queryPieza = `
      INSERT INTO piezas ("Descripcion", "Marca", "n_venta", "estado")
      VALUES ($1, $2, $3, $4)
      RETURNING "ID_Pieza";
    `;
    const valuesPieza = [
      descripcion,
      marca,
      n_venta || null,
      estado || 'libre'
    ];
    const resultPieza = await client.query(queryPieza, valuesPieza);

    const idPieza = resultPieza.rows[0].ID_Pieza;

    // 2. Insertar el stock en "stock_detallado"
    const queryStock = `
      INSERT INTO stock_detallado (id_pieza, id_proveedor, cantidad, estado, fecha_registro, id_proyecto)
      VALUES ($1, $2, $3, $4, NOW(), $5);
    `;
    const valuesStock = [
      idPieza,
      proveedor,
      parseInt(cantidad, 10),
      estado || 'libre',
      idProyecto || null
    ];
    await client.query(queryStock, valuesStock);

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Pieza y stock creados exitosamente.',
      idPieza
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pieza y stock:', error);
    res.status(500).json({ error: 'Error al crear la pieza y el stock.' });
  } finally {
    client.release();
  }
});


  
  

module.exports = router;
