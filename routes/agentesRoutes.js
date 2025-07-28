const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');

// Rotas relativas ao prefixo /agentes
router.get('/', agentesController.getAllAgentes);
router.get('/:id', agentesController.getAgenteById);
router.post('/', agentesController.createAgente);
router.put('/:id', agentesController.updateAgente);
router.patch('/:id', agentesController.partialUpdateAgente);
router.delete('/:id', agentesController.deleteAgente);

module.exports = router;
