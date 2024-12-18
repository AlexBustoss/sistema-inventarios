const { body } = require('express-validator');

const validarUsuarioPost = [
    body('Nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('Email').isEmail().withMessage('Debe ser un correo válido'),
    body('Rol').isIn(['Administrador', 'Usuario']).withMessage('Rol inválido'),
    body('Password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const validarUsuarioPut = [
    body('Nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('Email').isEmail().withMessage('Debe ser un correo válido'),
    body('Rol').isIn(['Administrador', 'Usuario']).withMessage('Rol inválido'),
];

module.exports = { validarUsuarioPost, validarUsuarioPut };
