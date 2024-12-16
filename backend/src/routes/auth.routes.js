const express = require('express');
const { login } = require('../controllers/auth.controller');

const router = express.Router();

// Ruta para login
router.post('/login', login);

module.exports = router;
