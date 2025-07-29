const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require('../utils/errorHandler');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const moment = require('moment');

async function getAllAgentes(req, res) {
    try {
        let agentes = agentesRepository.findAll();

        const { nome, cargo, dataDeIncorporacao, dataInicial, dataFinal, sortBy, order } = req.query;

        if (nome) {
            agentes = agentes.filter(a => a.nome.toLowerCase().includes(nome.toLowerCase()));
        }

        if (cargo) {
            agentes = agentes.filter(a => a.cargo.toLowerCase() === cargo.toLowerCase());
        }

        if (dataDeIncorporacao && !dataInicial && !dataFinal) {
            agentes = agentes.filter(a => a.dataDeIncorporacao === dataDeIncorporacao);
        }

        if (dataInicial || dataFinal) {
            agentes = agentes.filter(a => {
                const data = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
                const inicio = dataInicial ? moment(dataInicial, 'YYYY-MM-DD') : null;
                const fim = dataFinal ? moment(dataFinal, 'YYYY-MM-DD') : null;

                let after = !inicio || data.isSameOrAfter(inicio, 'day');
                let before = !fim || data.isSameOrBefore(fim, 'day');

                return after && before;
            });
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

        return res.json(agentes);
    } catch (err) {
        next(err);
    }
}

async function getAgenteById(req, res) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const agente = agentesRepository.findAll().find(a => a.id === id);

        if (!agente) {
            throw new AppError("Agente não encontrado", 404);
        }

        res.json(agente);
    } catch (err) {
        next(err);
    }
}

async function createAgente(req, res) {
    try {
        const newAgente = req.body;

        if (!newAgente.nome || !newAgente.dataDeIncorporacao || !newAgente.cargo) {
            throw new AppError("Dados do agente incompletos", 400);
        }

        const dataIncorporacao = moment(newAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);

        if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
            throw new AppError("Data de incorporação inválida ou futura", 400);
        }

        newAgente.id = uuidv4();
        agentesRepository.add(newAgente);
        res.status(201).json(newAgente);
    } catch (err) {
        next(err);
    }
}

async function updateAgente(req, res) {
    try {
        const id = req.params.id;
        let updatedAgente = req.body;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        if ('id' in updatedAgente) delete updatedAgente.id;

        if (!updatedAgente.nome || !updatedAgente.dataDeIncorporacao || !updatedAgente.cargo) {
            throw new AppError("Dados do agente incompletos", 400);
        }

        const dataIncorporacao = moment(updatedAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);
        if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
            throw new AppError("Data de incorporação inválida ou futura", 400);
        }

        const index = agentesRepository.findAll().findIndex(a => a.id === id);
        if (index === -1) {
            throw new AppError("Agente não encontrado", 404);
        }

        updatedAgente.id = id;
        agentesRepository.update(index, updatedAgente);
        res.json(updatedAgente);
    } catch (err) {
        next(err);
    }
}

async function partialUpdateAgente(req, res) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const updates = req.body;

        if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
            throw new AppError("Payload vazio ou inválido", 400);
        }

        if ('id' in updates) delete updates.id;

        if (updates.dataDeIncorporacao) {
            const dataIncorporacao = moment(updates.dataDeIncorporacao, 'YYYY-MM-DD', true);
            if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
                throw new AppError("Data de incorporação inválida ou futura", 400);
            }
        }

        if (updates.nome !== undefined && !updates.nome) {
            throw new AppError("Nome inválido", 400);
        }
        if (updates.cargo !== undefined && !updates.cargo) {
            throw new AppError("Cargo inválido", 400);
        }

        const agentes = agentesRepository.findAll();
        const index = agentes.findIndex(a => a.id === id);
        if (index === -1) {
            throw new AppError("Agente não encontrado", 404);
        }

        const agente = agentes[index];
        const updatedAgente = { ...agente, ...updates, id };

        agentesRepository.update(index, updatedAgente);
        res.json(updatedAgente);
    } catch (err) {
        next(err);
    }
}

async function deleteAgente(req, res) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const index = agentesRepository.findAll().findIndex(a => a.id === id);
        if (index !== -1) {
            agentesRepository.remove(index);
            return res.status(204).send();
        } else {
            throw new AppError("Agente não encontrado", 404);
        }
    } catch (err) {
        next(err);
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
