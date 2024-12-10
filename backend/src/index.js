require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const db = require('../src/config/db.js');
const usuariosRoutes = require('../src/routes/usuarios.routes.js'); // Importar las rutas de usuarios
const requisicionesRoutes = require('../src/routes/requisiciones.routes.js'); // Importar las rutas de requisiciones
const detalleRequisicionesRoutes = require('../src/routes/detalleRequisiciones.routes.js'); // Importar las rutas de detalle_requisiciones



const swaggerUi = require('swagger-ui-express'); // Importar Swagger UI
const swaggerDocs = require('./swaggerConfig'); // Configuración de Swagger

// Swagger - Interfaz de documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json()); // Middleware para procesar JSON
app.use('/api', usuariosRoutes); // Prefijo '/api' para las rutas de usuarios
app.use('/api/requisiciones', requisicionesRoutes); // Prefijo '/api/requisiciones' para las rutas de requisiciones
app.use('/api/detalle_requisiciones', detalleRequisicionesRoutes);


// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log(`Swagger Docs disponible en http://localhost:${PORT}/api-docs`);
  });