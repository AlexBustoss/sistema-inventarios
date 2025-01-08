const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importa la función initPool
const pool = initPool(); // Inicializa el pool correctamente



// Obtener todas las marcas de piezas
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM marcas_piezas');
      res.status(200).json(result.rows); // Devuelve las marcas como JSON
    } catch (error) {
      console.error('Error al obtener marcas de piezas:', error);
      res.status(500).json({ error: 'Error al obtener marcas de piezas' });
    }
  });
  

// Obtener una marca de pieza por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM marcas_piezas WHERE "ID_Pieza" = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener marca de pieza:', error);
        res.status(500).json({ error: 'Error al obtener marca de pieza' });
    }
});




// Crear una nueva marca de pieza
router.post('/', async (req, res) => {
    const { ID_Pieza, Marca, Descripcion } = req.body;

    // Validar campos obligatorios
    if (!ID_Pieza || !Marca || !Descripcion) {
        return res.status(400).json({ error: 'Campos obligatorios: ID_Pieza, Marca, Descripcion' });
    }

    try {
        const query = `
            INSERT INTO marcas_piezas ("ID_Pieza", "Marca", "Descripcion")
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [ID_Pieza, Marca, Descripcion];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear marca de pieza:', error);
        res.status(500).json({ error: 'Error al crear marca de pieza' });
    }
});





// Actualizar una marca de pieza existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Marca, Descripcion } = req.body;

    // Validar campos obligatorios
    if (!Marca || !Descripcion) {
        return res.status(400).json({ error: 'Campos obligatorios: Marca, Descripcion' });
    }

    try {
        const query = `
            UPDATE marcas_piezas
            SET "Marca" = $1, "Descripcion" = $2
            WHERE "ID_Pieza" = $3
            RETURNING *;
        `;
        const values = [Marca, Descripcion, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar marca de pieza:', error);
        res.status(500).json({ error: 'Error al actualizar marca de pieza' });
    }
});


// Eliminar una marca de pieza
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM marcas_piezas WHERE "ID_Pieza" = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Marca de pieza no encontrada' });
        }
        res.status(200).json({ message: 'Marca de pieza eliminada', marcaPieza: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar marca de pieza:', error);
        res.status(500).json({ error: 'Error al eliminar marca de pieza' });
    }
});

// Validar o crear una nueva marca
// Validar o crear una nueva marca
router.post('/validar-o-crear', async (req, res) => {
    const { nombre } = req.body;

    // Validar que el campo nombre no esté vacío
    if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    try {

        // Buscar la marca en la base de datos
        const buscarMarcaQuery = 'SELECT "ID_Pieza" FROM marcas_piezas WHERE "Marca" = $1';
        const buscarMarcaResult = await pool.query(buscarMarcaQuery, [nombre]);

        if (buscarMarcaResult.rowCount > 0) {
            // Si la marca ya existe, devolver su ID
            return res.status(200).json({ id_marca: buscarMarcaResult.rows[0].ID_Pieza });
        }

        // Si la marca no existe, crearla
        const crearMarcaQuery = `
            INSERT INTO marcas_piezas ("Marca")
            VALUES ($1)
            RETURNING "ID_Pieza";
        `;
        const crearMarcaResult = await pool.query(crearMarcaQuery, [nombre]);
        return res.status(201).json({ id_marca: crearMarcaResult.rows[0].ID_Pieza });
    } catch (error) {
        console.error('Error al validar o crear marca:', error);
        res.status(500).json({ error: 'Error al validar o crear marca' });
    }
});



module.exports = router;
