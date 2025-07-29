const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

function getAllCasos(req, res) {
    let casos = casosRepository.findAll();

    const { status, agente_id, sortBy, order, keyword } = req.query;

    if (status) {
        casos = casos.filter(c =>
            (c.status && c.status.toLowerCase() === status.toLowerCase())
        );
    }

    if (agente_id) {
        casos = casos.filter(c =>
            (c.agente_id && c.agente_id === agente_id)
        );
    }

    if (keyword) {
        const kw = keyword.toLowerCase();
        casos = casos.filter(c =>
            (c.titulo && c.titulo.toLowerCase().includes(kw)) ||
            (c.descricao && c.descricao.toLowerCase().includes(kw))
        );
    }

    if (sortBy) {
        const orderDirection = order === 'desc' ? -1 : 1;
        casos.sort((a, b) => {
            if (!a[sortBy] || !b[sortBy]) return 0;
            if (typeof a[sortBy] === 'string') {
                return a[sortBy].localeCompare(b[sortBy]) * orderDirection;
            }
            if (typeof a[sortBy] === 'number') {
                return (a[sortBy] - b[sortBy]) * orderDirection;
            }
            return 0;
        });
    }

    if (casos.length === 0) {
        return res.status(404).json({
            message: "Nenhum caso encontrado para os filtros aplicados."
        });
    }

    return res.json(casos);
}

function getCasoById(req, res) {
    const id = req.params.id;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const caso = casosRepository.findAll().find(c => c.id === id);

    if (caso) {
        res.json(caso);
    } else {
        res.status(404).send({ message: "Caso não encontrado" });
    }
}

function createCaso(req, res) {
    const newCaso = req.body;
    const statusValidos = ['aberto', 'solucionado'];

    if (!newCaso.titulo || !newCaso.descricao || !newCaso.status || !newCaso.agente_id) {
        return res.status(400).send({ message: "Dados do caso incompletos" });
    }

    if (!statusValidos.includes(newCaso.status.toLowerCase())) {
        return res.status(400).send({ message: "Status inválido. Deve ser 'aberto' ou 'solucionado'" });
    }

    if (!uuidValidate(newCaso.agente_id)) {
        return res.status(400).send({ message: "ID do agente inválido" });
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
    let updatedCaso = req.body;
    const statusValidos = ['aberto', 'solucionado'];

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    if ('id' in updatedCaso) delete updatedCaso.id;

    if (!updatedCaso.titulo || !updatedCaso.descricao || !updatedCaso.status || !updatedCaso.agente_id) {
        return res.status(400).send({ message: "Dados do caso incompletos" });
    }

    if (!statusValidos.includes(updatedCaso.status.toLowerCase())) {
        return res.status(400).send({ message: "Status inválido. Deve ser 'aberto' ou 'solucionado'" });
    }

    if (!uuidValidate(updatedCaso.agente_id)) {
        return res.status(400).send({ message: "ID do agente inválido" });
    }

    const agenteExiste = agentesRepository.findAll().some(a => a.id === updatedCaso.agente_id);
    if (!agenteExiste) {
        return res.status(404).send({ message: "Agente responsável não encontrado" });
    }

    const index = casosRepository.findAll().findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).send({ message: "Caso não encontrado" });
    }

    updatedCaso.id = id;
    casosRepository.update(index, updatedCaso);
    res.json(updatedCaso);
}

function partialUpdateCaso(req, res) {
    const id = req.params.id;
    const statusValidos = ['aberto', 'solucionado'];

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const updates = req.body;
    const caso = casosRepository.findAll().find(c => c.id === id);

    if (!caso) {
        return res.status(404).send({ message: "Caso não encontrado" });
    }

    if (updates.status !== undefined) {
        if (!statusValidos.includes(updates.status.toLowerCase())) {
            return res.status(400).send({ message: "Status inválido. Deve ser 'aberto' ou 'solucionado'" });
        }
    }

    if ('id' in updates) delete updates.id;

    if (updates.agente_id) {
        if (!uuidValidate(updates.agente_id)) {
            return res.status(400).send({ message: "ID do agente inválido" });
        }
        const agenteExiste = agentesRepository.findAll().some(a => a.id === updates.agente_id);
        if (!agenteExiste) {
            return res.status(404).send({ message: "Agente responsável não encontrado" });
        }
    }

    if (updates.titulo !== undefined && !updates.titulo) {
        return res.status(400).send({ message: "Título inválido" });
    }
    if (updates.descricao !== undefined && !updates.descricao) {
        return res.status(400).send({ message: "Descrição inválida" });
    }
    if (updates.status !== undefined && !updates.status) {
        return res.status(400).send({ message: "Status inválido" });
    }

    if ('id' in updates) delete updates.id;
    Object.assign(caso, updates);
    res.json(caso);
}

function removeCaso(req, res) {
    const id = req.params.id;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const index = casosRepository.findAll().findIndex(c => c.id === id);
    if (index !== -1) {
        casosRepository.remove(index);
        return res.status(204).send();
    } else {
        return res.status(404).send({ message: "Caso não encontrado" });
    }
}

module.exports = {
    getAllCasos,
    getCasoById,
    createCaso,
    updateCaso,
    partialUpdateCaso,
    removeCaso
};
