const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Gestión de Inventarios',
      version: '1.0.0',
      description: 'Documentación interactiva para la API del sistema',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // direccion servidor
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Archivos donde se documentan las rutas
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
