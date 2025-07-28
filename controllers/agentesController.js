const agentesRepository = require("../repositories/agentesRepository");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

function getAllAgentes(req, res) {
  console.log('✅ Rota GET /agentes acessada');
  const agentes = agentesRepository.findAll();
  res.json(agentes);
}

function getAgenteById(req, res) {
    const id = req.params.id;
    const agente = agentesRepository.findAll().find(a => a.id === id);

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    if (agente) {
        res.json(agente);
    } else {
        res.status(404).send({ message: "Agente não encontrado" });
    }
}

function createAgente(req, res) {
    const newAgente = req.body;

    if (!newAgente.nome || !newAgente.dataDeIncorporacao || !newAgente.cargo) {
        return res.status(400).send({ message: "Dados do agente incompletos" });
    }
    newAgente.id = uuidv4();
    agentesRepository.add(newAgente);
    res.status(201).json(newAgente);
}

function updateAgente(req, res) {
    const id = req.params.id;
    const updatedAgente = req.body;
    const index = agentesRepository.findAll().findIndex(a => a.id === id);

    if (!updatedAgente.nome || !updatedAgente.dataDeIncorporacao || !updatedAgente.cargo) {
        return res.status(400).send({ message: "Dados do agente incompletos" });
    }
    
    if (index !== -1) {
        updatedAgente.id = id;
        agentesRepository.update(index, updatedAgente);
        res.json(updatedAgente);
    } else {
        res.status(404).send({ message: "Agente não encontrado" });
    }
}

function partialUpdateAgente(req, res) {
    const id = req.params.id;
    const updates = req.body;
    const agente = agentesRepository.findAll().find(a => a.id === id);
    if (agente) {
        Object.assign(agente, updates);
        res.json(agente);
    } else {
        res.status(404).send({ message: "Agente não encontrado" });
    }
}

function deleteAgente(req, res) {
    const id = req.params.id;
    const index = agentesRepository.findAll().findIndex(a => a.id === id);
    if (index !== -1) {
        agentesRepository.remove(index);
        res.status(204).send();
    } else {
        res.status(404).send({ message: "Agente não encontrado" });
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    partialUpdateAgente,
    deleteAgente
}