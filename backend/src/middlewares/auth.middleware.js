const jwt = require('jsonwebtoken');

// Middleware para validar el token JWT
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
