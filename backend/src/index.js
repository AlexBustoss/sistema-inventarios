require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
console.log('Clave secreta JWT_SECRET:', process.env.JWT_SECRET);

const express = require('express');
const { initPool, closePool } = require('./config/db'); // Importar funciones de conexión a la base de datos
const cors = require('cors'); // Importar el middleware CORS
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar el pool de conexiones a la base de datos
initPool();

// Middleware para procesar JSON
app.use(express.json());

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"], // Incluye ambos puertos
        methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
        allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
    })
);

// Habilitar Swagger en modo desarrollo
if (process.env.NODE_ENV === 'development') {
    console.log('Swagger habilitado en modo desarrollo');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} else {
    console.log('Swagger deshabilitado en producción');
}

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
const comprasRoutes = require('./routes/compras.routes');
const stockRoutes = require('./routes/stock_detallado.routes');
const reportesRoutes = require('./routes/reportes.routes');
const proyectosRoutes = require('./routes/proyectos.routes');


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
app.use('/api/compras', comprasRoutes);
app.use('/api/stock_detallado', stockRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/proyectos', proyectosRoutes);


// Ruta básica de prueba
app.get('/', (req, res) => {
    res.redirect('http://localhost:5174'); // Redirigir al frontend automáticamente
});

// Middleware para manejar errores globalmente
app.use((err, req, res, next) => {
    console.error('Error global:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

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
