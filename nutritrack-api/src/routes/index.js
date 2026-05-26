const router = require('express').Router();

router.use('/auth',            require('./auth.routes'));
router.use('/alimentos',       require('./alimentos.routes'));
router.use('/registros',       require('./registros.routes'));
router.use('/dashboard',       require('./dashboard.routes'));
router.use('/perfil',          require('./perfil.routes'));
router.use('/historial',       require('./historial.routes'));
router.use('/recetas',         require('./recetas.routes'));
router.use('/notificaciones',  require('./notificaciones.routes'));

module.exports = router;
