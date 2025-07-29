const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { AppError } = require("../utils/errorHandler");

async function getAllCasos(req, res, next) {
    try {
        let casos = casosRepository.findAll();

        const { status, agente_id, sortBy, order, keyword } = req.query;

        if (status) {
            casos = casos.filter(c =>
                c.status && c.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (agente_id) {
            casos = casos.filter(c =>
                c.agente_id && c.agente_id === agente_id
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
            throw new AppError("Nenhum caso encontrado para os filtros aplicados.", 404);
        }

        res.json(casos);
    } catch (err) {
        next(err);
    }
}

async function getCasoById(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const caso = casosRepository.findAll().find(c => c.id === id);

        if (!caso) {
            throw new AppError("Caso não encontrado", 404);
        }

        res.json(caso);
    } catch (err) {
        next(err);
    }
}

async function createCaso(req, res, next) {
    try {
        const newCaso = req.body;
        const statusValidos = ['aberto', 'solucionado'];

        if (!newCaso.titulo || !newCaso.descricao || !newCaso.status || !newCaso.agente_id) {
            throw new AppError("Dados do caso incompletos", 400);
        }

        if (!statusValidos.includes(newCaso.status.toLowerCase())) {
            throw new AppError("Status inválido. Deve ser 'aberto' ou 'solucionado'", 400);
        }

        if (!uuidValidate(newCaso.agente_id)) {
            throw new AppError("ID do agente inválido", 400);
        }

        const agenteExiste = agentesRepository.findAll().some(a => a.id === newCaso.agente_id);
        if (!agenteExiste) {
            throw new AppError("Agente responsável não encontrado", 404);
        }

        newCaso.id = uuidv4();
        casosRepository.add(newCaso);
        res.status(201).json(newCaso);
    } catch (err) {
        next(err);
    }
}

async function updateCaso(req, res, next) {
    try {
        const id = req.params.id;
        let updatedCaso = req.body;
        const statusValidos = ['aberto', 'solucionado'];

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        if ('id' in updatedCaso) delete updatedCaso.id;

        if (!updatedCaso.titulo || !updatedCaso.descricao || !updatedCaso.status || !updatedCaso.agente_id) {
            throw new AppError("Dados do caso incompletos", 400);
        }

        if (!statusValidos.includes(updatedCaso.status.toLowerCase())) {
            throw new AppError("Status inválido. Deve ser 'aberto' ou 'solucionado'", 400);
        }

        if (!uuidValidate(updatedCaso.agente_id)) {
            throw new AppError("ID do agente inválido", 400);
        }

        const agenteExiste = agentesRepository.findAll().some(a => a.id === updatedCaso.agente_id);
        if (!agenteExiste) {
            throw new AppError("Agente responsável não encontrado", 404);
        }

        const index = casosRepository.findAll().findIndex(c => c.id === id);
        if (index === -1) {
            throw new AppError("Caso não encontrado", 404);
        }

        updatedCaso.id = id;
        casosRepository.update(index, updatedCaso);
        res.json(updatedCaso);
    } catch (err) {
        next(err);
    }
}

async function partialUpdateCaso(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const updates = req.body;
        if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
            throw new AppError("Payload vazio ou inválido", 400);
        }

        const casos = casosRepository.findAll();
        const index = casos.findIndex(c => c.id === id);
        if (index === -1) {
            throw new AppError("Caso não encontrado", 404);
        }

        if ('id' in updates) delete updates.id;

        Object.assign(casos[index], updates);
        casos[index].id = id;

        casosRepository.update(index, casos[index]);
        res.json(casos[index]);
    } catch (err) {
        next(err);
    }
}

async function removeCaso(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) {
            throw new AppError("ID inválido", 400);
        }

        const index = casosRepository.findAll().findIndex(c => c.id === id);
        if (index === -1) {
            throw new AppError("Caso não encontrado", 404);
        }

        casosRepository.remove(index);
        res.status(204).send();
    } catch (err) {
        next(err);
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
