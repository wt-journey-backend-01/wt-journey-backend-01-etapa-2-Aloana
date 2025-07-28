const casosRepository = require("../repositories/casosRepository")
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

function getAllCasos(req, res) {

    const casos = casosRepository.findAll()
    res.json(casos)
}

function getCasoById(req, res) {
    const id = req.params.id;
    const caso = casosRepository.findAll().find(c => c.id === id);

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    if (caso) {
        res.json(caso);
    } else {
        res.status(404).send({ message: "Caso não encontrado" });
    }
}
function createCaso(req, res) {
    const newCaso = req.body;

    if (!newCaso.titulo || !newCaso.descricao || !newCaso.status || !newCaso.agente_id) {
        return res.status(400).send({ message: "Dados do caso incompletos" });
    }

    const agenteExiste = agentesRepository.findAll().some(a => a.id === newCaso.agente_id);
    if (!agenteExiste) {
        return res.status(404).send({ message: "Agente responsável não encontrado" });
    }
    newCaso.id = uuidv4();
    casosRepository.add(newCaso);
    res.status(201).json(newCaso);
}

function updateCaso(req, res) {
    const id = req.params.id;
    const updatedCaso = req.body;
    const index = casosRepository.findAll().findIndex(c => c.id === id);
    if (index !== -1) {
        updatedCaso.id = id;
        casosRepository.update(index, updatedCaso);
        res.json(updatedCaso);
    } else {
        res.status(404).send({ message: "Caso não encontrado" });
    }
}

function partialUpdateCaso(req, res) {
    const id = req.params.id;
    const updates = req.body;
    const caso = casosRepository.findAll().find(c => c.id === id);
    if (caso) {
        Object.assign(caso, updates);
        res.json(caso);
    } else {
        res.status(404).send({ message: "Caso não encontrado" });
    }
}

function removeCaso(req, res) {
    const id = req.params.id;
    const index = casosRepository.findAll().findIndex(c => c.id === id);
    if (index !== -1) {
        casosRepository.remove(index);
        res.status(204).send();
    } else {
        res.status(404).send({ message: "Caso não encontrado" });
    }
}

module.exports = {
    getAllCasos,
    getCasoById,
    createCaso,
    updateCaso,
    partialUpdateCaso,
    removeCaso
}