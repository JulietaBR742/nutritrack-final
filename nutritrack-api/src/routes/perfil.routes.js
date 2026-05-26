const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/perfil.controller');

// GET /api/perfil
// PUT /api/perfil
router.get('/', auth, ctrl.obtener);
router.put('/', auth, ctrl.actualizar);

module.exports = router;
