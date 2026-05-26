const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/historial.controller');

router.get('/peso',       auth, ctrl.obtenerPeso);
router.post('/peso',      auth, ctrl.registrarPeso);
router.get('/agua',       auth, ctrl.obtenerAgua);
router.post('/agua',      auth, ctrl.registrarAgua);

module.exports = router;
