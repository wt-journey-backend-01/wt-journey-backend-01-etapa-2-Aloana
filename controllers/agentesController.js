const agentesRepository = require("../repositories/agentesRepository");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const moment = require('moment');

function getAllAgentes(req, res) {
    let agentes = agentesRepository.findAll();

    const { nome, cargo, dataDeIncorporacao, sortBy, order } = req.query;

    if (nome) {
        agentes = agentes.filter(a => a.nome.toLowerCase().includes(nome.toLowerCase()));
    }

    if (cargo) {
        agentes = agentes.filter(a => a.cargo.toLowerCase() === cargo.toLowerCase());
    }

    if (dataDeIncorporacao) {
        agentes = agentes.filter(a => a.dataDeIncorporacao === dataDeIncorporacao);
    }

    if (req.query.sortBy === 'dataDeIncorporacao') {
        const orderDirection = req.query.order === 'desc' ? -1 : 1;
        agentes.sort((a, b) => (a.dataDeIncorporacao.localeCompare(b.dataDeIncorporacao)) * orderDirection);
    }

    if (sortBy) {
        const orderDirection = order === 'desc' ? -1 : 1;
        agentes.sort((a, b) => {
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

    res.json(agentes);
}

function getAgenteById(req, res) {
    const id = req.params.id;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const agente = agentesRepository.findAll().find(a => a.id === id);

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

    const dataIncorporacao = moment(newAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);

    if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
        return res.status(400).send({ message: "Data de incorporação inválida ou futura" });
    }

    newAgente.id = uuidv4();
    agentesRepository.add(newAgente);
    res.status(201).json(newAgente);
}

function updateAgente(req, res) {
    const id = req.params.id;
    let updatedAgente = req.body;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    if ('id' in updatedAgente) delete updatedAgente.id;

    if (!updatedAgente.nome || !updatedAgente.dataDeIncorporacao || !updatedAgente.cargo) {
        return res.status(400).send({ message: "Dados do agente incompletos" });
    }

    const dataIncorporacao = moment(updatedAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);
    if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
        return res.status(400).send({ message: "Data de incorporação inválida ou futura" });
    }

    const index = agentesRepository.findAll().findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).send({ message: "Agente não encontrado" });
    }

    updatedAgente.id = id;
    agentesRepository.update(index, updatedAgente);
    res.json(updatedAgente);
}

function partialUpdateAgente(req, res) {
    const id = req.params.id;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const updates = req.body;

    if ('id' in updates) delete updates.id;

    if (updates.dataDeIncorporacao) {
        const dataIncorporacao = moment(updates.dataDeIncorporacao, 'YYYY-MM-DD', true);
        if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
            return res.status(400).send({ message: "Data de incorporação inválida ou futura" });
        }
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
        return res.status(400).send({ message: "Payload vazio ou inválido" });
    }

    if (updates.nome !== undefined && !updates.nome) {
        return res.status(400).send({ message: "Nome inválido" });
    }
    if (updates.cargo !== undefined && !updates.cargo) {
        return res.status(400).send({ message: "Cargo inválido" });
    }

    const agente = agentesRepository.findAll().find(a => a.id === id);

    if (!agente) {
        return res.status(404).send({ message: "Agente não encontrado" });
    }

    if ('id' in updates) delete updates.id;
    Object.assign(agente, updates);
    res.json(agente);
}

function deleteAgente(req, res) {
    const id = req.params.id;

    if (!uuidValidate(id)) {
        return res.status(400).send({ message: "ID inválido" });
    }

    const index = agentesRepository.findAll().findIndex(a => a.id === id);
    if (index !== -1) {
        agentesRepository.remove(index);
        return res.status(204).send();
    } else {
        return res.status(404).send({ message: "Agente não encontrado" });
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    partialUpdateAgente,
    deleteAgente
};
