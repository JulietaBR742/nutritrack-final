const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/alimentos.controller');

// GET  /api/alimentos          → catálogo completo (con filtros opcionales)
// GET  /api/alimentos/:id      → un alimento
// POST /api/alimentos          → crear alimento personalizado
router.get('/',    auth, ctrl.listar);
router.get('/:id', auth, ctrl.obtener);
router.post('/',   auth, ctrl.crear);

module.exports = router;
