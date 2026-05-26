const router = require('express').Router();
const auth   = require('../middlewares/auth');
const ctrl   = require('../controllers/dashboard.controller');

// GET /api/dashboard?fecha=2024-05-01
router.get('/', auth, ctrl.resumen);

module.exports = router;
