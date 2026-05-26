const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/registros.controller');

// GET    /api/registros?fecha=2024-05-01   → registros del día
// POST   /api/registros                    → agregar registro
// DELETE /api/registros/:id               → eliminar registro
router.get('/',    auth, ctrl.listarPorFecha);
router.post('/',   auth, ctrl.crear);
router.delete('/:id', auth, ctrl.eliminar);

module.exports = router;
