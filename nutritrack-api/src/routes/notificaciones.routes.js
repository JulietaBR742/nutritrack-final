const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/notificaciones.controller');

router.get('/',             auth, ctrl.listar);
router.put('/:id/leer',     auth, ctrl.marcarLeida);
router.put('/leer-todas',   auth, ctrl.marcarTodas);

module.exports = router;
