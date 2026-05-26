const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');

// POST /api/auth/registro
router.post('/registro', ctrl.registro);

// POST /api/auth/login
router.post('/login', ctrl.login);

module.exports = router;
