const jwt = require('jsonwebtoken');

/* Middleware para validar el token JWT
const validarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secreto_predeterminado');
        req.usuario = decoded;
        next();
    } catch (err) {
        console.error('Error en la validación del token:', err.message);
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const validarToken = (req, res, next) => {
    // Log temporal para asegurarte de que se está ejecutando
    console.log("Autenticación deshabilitada temporalmente.");
    
    // Omitimos la validación del token y seguimos al siguiente middleware
    req.usuario = { Rol: 'admin' }; // Opcional: Asignar un rol por defecto si es necesario
    next();
};


// Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const { Rol } = req.usuario;

        if (!rolesPermitidos.includes(Rol)) {
            return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
        }
        next();
    };
};

module.exports = { validarToken, verificarRol };
*/

exports.verifyToken = (req, res, next) => {
    // Comentar toda la lógica de validación
    // const token = req.headers["authorization"];
    // if (!token) {
    //   return res.status(403).send({ message: "No token provided!" });
    // }
  
    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   req.userId = decoded.id;
    //   next();
    // } catch (error) {
    //   return res.status(401).send({ message: "Unauthorized!" });
    // }
  
    // Permitir acceso sin autenticación
    req.userId = 1; // ID de usuario temporal para simular autenticación
    next();
  };
  