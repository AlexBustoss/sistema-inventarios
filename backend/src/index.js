require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const { initPool, closePool } = require('./config/db'); // Importar funciones de conexión a la base de datos

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar el pool de conexiones a la base de datos
initPool(); // Importante: inicializa el pool antes de usarlo

// Importar rutas
const usuariosRoutes = require('./routes/usuarios.routes.js');
const requisicionesRoutes = require('./routes/requisiciones.routes.js');
const detalleRequisicionesRoutes = require('./routes/detalleRequisiciones.routes.js');
const piezasRoutes = require('./routes/piezas.routes');
const ordenesPiezasRoutes = require('./routes/ordenesPiezas.routes');
const estadosRequisicionRoutes = require('./routes/estadosRequisicion.routes');
const marcasPiezasRoutes = require('./routes/marcasPiezas.routes');
const movimientosInventarioRoutes = require('./routes/movimientos_inventario.routes.js');
const piezasProveedoresRoutes = require('./routes/piezasProveedores.routes.js');
const proveedoresRoutes = require('./routes/proveedores.routes.js');
const ubicacionesProveedoresRoutes = require('./routes/ubicacionesProveedores.routes.js');
const unidadesMedidaRoutes = require('./routes/unidadesMedida.routes.js');
const authRoutes = require('./routes/auth.routes.js');

// Importar middleware para manejo de errores
const manejarErrores = require('./middlewares/manejarErrores.js');

// Importar Swagger para la documentación
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');

// Habilitar o deshabilitar Swagger basado en el entorno
if (process.env.NODE_ENV === 'development') {
    console.log('Swagger habilitado en modo desarrollo');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} else {
    console.log('Swagger deshabilitado en producción');
}

// Middleware para procesar JSON
app.use(express.json());

// Registrar las rutas
app.use('/api', usuariosRoutes);
app.use('/api/requisiciones', requisicionesRoutes);
app.use('/api/detalle_requisiciones', detalleRequisicionesRoutes);
app.use('/api/piezas', piezasRoutes);
app.use('/api/ordenes_piezas', ordenesPiezasRoutes);
app.use('/api/estados_requisicion', estadosRequisicionRoutes);
app.use('/api/marcas_piezas', marcasPiezasRoutes);
app.use('/api/movimientos_inventario', movimientosInventarioRoutes);
app.use('/api/piezas_proveedores', piezasProveedoresRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ubicaciones_proveedores', ubicacionesProveedoresRoutes);
app.use('/api/unidades_medida', unidadesMedidaRoutes);
app.use('/api/auth', authRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Middleware para manejar errores globalmente
app.use(manejarErrores);

// Iniciar el servidor solo si no está en modo de prueba
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor iniciado en http://localhost:${PORT}`);
        console.log(`Swagger Docs disponible en http://localhost:${PORT}/api-docs`);
    });
}

// Cerrar conexiones al recibir una señal de terminación (graceful shutdown)
process.on('SIGTERM', async () => {
    console.log('Cerrando conexiones...');
    await closePool(); // Liberar conexiones del pool
    process.exit(0);
});

// Exportar la instancia de app para pruebas
module.exports = app;
