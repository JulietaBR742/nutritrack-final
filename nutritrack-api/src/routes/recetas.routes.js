const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/recetas.controller');

// GET  /api/recetas       → listar recetas
// GET  /api/recetas/:id   → detalle con ingredientes
// POST /api/recetas       → crear receta
router.get('/',    auth, ctrl.listar);
router.get('/:id', auth, ctrl.obtener);
router.post('/',   auth, ctrl.crear);

module.exports = router;
