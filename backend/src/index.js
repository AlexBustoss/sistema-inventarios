require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const db = require('../src/config/db.js');
const usuariosRoutes = require('../src/routes/usuarios.routes.js'); // Importar las rutas de usuarios
const requisicionesRoutes = require('../src/routes/requisiciones.routes.js'); // Importar las rutas de requisiciones
const detalleRequisicionesRoutes = require('../src/routes/detalleRequisiciones.routes.js'); // Importar las rutas de detalle_requisiciones
const piezasRoutes = require('../src/routes/piezas.routes'); // Importar las rutas de piezas
const ordenesPiezasRoutes = require('../src/routes/ordenesPiezas.routes'); // Importar las rutas de ordenesPiezas
const estadosRequisicionRoutes = require('../src/routes/estadosRequisicion.routes'); // Importar las rutas de estadosRequisicion
const marcasPiezasRoutes = require('../src/routes/marcasPiezas.routes'); // Importar las rutas de marcasPiezas
const movimientosInventarioRoutes = require('../src/routes/movimientos_inventario.routes.js'); // Importar las rutas de movimientosInventario
const piezasProveedoresRoutes = require('../src/routes/piezasProveedores.routes.js'); // Importar las rutas de piezasProveedores
const proveedoresRoutes = require('../src/routes/proveedores.routes.js'); // Importar las rutas de proveedores
const ubicacionesProveedoresRoutes = require('../src/routes/ubicacionesProveedores.routes.js'); // Importar las rutas de ubicacionesProveedores
const unidadesMedidaRoutes = require('../src/routes/unidadesMedida.routes.js'); // Importar las rutas de unidadesMedida







const swaggerUi = require('swagger-ui-express'); // Importar Swagger UI
const swaggerDocs = require('./swaggerConfig'); // Configuración de Swagger

// Habilitar o deshabilitar Swagger basado en el entorno
if (process.env.NODE_ENV !== 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log('Swagger habilitado');
} else {
    console.log('Swagger deshabilitado en modo desarrollo');
}

app.use(express.json()); // Middleware para procesar JSON
app.use('/api', usuariosRoutes); // Prefijo '/api' para las rutas de usuarios
app.use('/api/requisiciones', requisicionesRoutes); // Prefijo '/api/requisiciones' para las rutas de requisiciones
app.use('/api/detalle_requisiciones', detalleRequisicionesRoutes); // Prefijo '/api/detalle_requisiciones' para las rutas de detalle_requisiciones
app.use('/api/piezas', piezasRoutes); // Prefijo '/api/piezas' para las rutas de piezas
app.use('/api/ordenes_piezas', ordenesPiezasRoutes); // Prefijo '/api/ordenes_piezas' para las rutas de ordenes_piezas
app.use('/api/estados_requisicion', estadosRequisicionRoutes); // Prefijo '/api/estados_requisicion' para las rutas de estados_requisicion
app.use('/api/marcas_piezas', marcasPiezasRoutes); // Prefijo '/api/marcas_piezas' para las rutas de marcas_piezas
app.use('/api/movimientos_inventario', movimientosInventarioRoutes); // Prefijo '/api/movimientos_inventario' para las rutas de movimientos_inventario
app.use('/api/piezas_proveedores', piezasProveedoresRoutes); // Prefijo '/api/piezas_proveedores' para las rutas de piezas_proveedores
app.use('/api/proveedores', proveedoresRoutes); // Prefijo '/api/proveedores' para las rutas de proveedores
app.use('/api/ubicaciones_proveedores', ubicacionesProveedoresRoutes); // Prefijo '/api/ubicaciones_proveedores' para las rutas de ubicaciones_proveedores
app.use('/api/unidades_medida', unidadesMedidaRoutes); // Prefijo '/api/unidades_medida' para las rutas de unidades_medida






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