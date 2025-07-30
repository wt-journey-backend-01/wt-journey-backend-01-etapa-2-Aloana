const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const moment = require('moment');
const { AppError } = require('../utils/errorHandler');
const agentesRepository = require('../repositories/agentesRepository');

async function getAllAgentes(req, res, next) {
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
            if (sortBy === 'dataDeIncorporacao') {
                agentes.sort((a, b) => {
                    const dateA = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
                    const dateB = moment(b.dataDeIncorporacao, 'YYYY-MM-DD');
                    if (!dateA.isValid() || !dateB.isValid()) return 0;
                    return dateA.isBefore(dateB) ? -1 * orderDirection : dateA.isAfter(dateB) ? 1 * orderDirection : 0;
                });
            } else {
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
        }
        res.json(agentes);
    } catch (error) {
        next(error);
    }
}

async function getAgenteById(req, res, next) {
    try {
        const { id } = req.params
        const agente = agentesRepository.findById(id)

        if (!agente)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(agente)
    } catch (error) {
        next(error);
    }
}

async function createAgente(req, res, next) {
    try {
        const { nome, dataDeIncorporacao, cargo } = req.body
        const id = uuidv4()

        if (!validarData(dataDeIncorporacao))
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

        if (!nome || !dataDeIncorporacao || !cargo)
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })

        const newAgente = { id, nome, dataDeIncorporacao, cargo }

        agentesRepository.create(newAgente)
        res.status(201).json(newAgente)
    } catch (error) {
        next(error);
    }
}

async function updateAgente(req, res, next) {
    try {
        const { id } = req.params
        const { nome, dataDeIncorporacao, cargo, id: idBody } = req.body

        if(idBody && idBody !== id)
            return res.status(400).json({message: "O campo 'id' não pode ser alterado."})

        if (dataDeIncorporacao) {
            const dataIncorporacao = moment(dataDeIncorporacao, 'YYYY-MM-DD', true);
            if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day')) {
                throw new AppError("Campo 'dataDeIncorporacao' inválido. Use formato YYYY-MM-DD e não informe datas futuras.", 400);
            }
        }

        if (!nome || !dataDeIncorporacao || !cargo)
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })

        const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo })

        if (!agenteAtualizado)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(agenteAtualizado)
    } catch (error) {
        next(error);
    }
}

async function partialUpdateAgente(req, res, next) {
    try {
        const { id } = req.params
        const updates = req.body
        const camposValidos = ['nome', 'dataDeIncorporacao', 'cargo']

        if('id' in updates)
            return res.status(400).json({message: "O campo 'id' não pode ser alterado."})

        const camposAtualizaveis = Object.keys(updates).filter(campo => camposValidos.includes(campo))

        if (updates.dataDeIncorporacao && !validarData(updates.dataDeIncorporacao))
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

        if (camposAtualizaveis.length === 0)
            return res.status(400).json({ message: 'Deve conter pelo menos um campo válido para atualização.' })

        const patchedAgente = agentesRepository.partialUpdateAgente(id, updates)

        if (!patchedAgente)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(patchedAgente)
    } catch (error) {
        next(error);
    }
}

async function deleteAgente(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        const index = agentesRepository.findAll().findIndex(a => a.id === id);
        if (index === -1) throw new AppError("Agente não encontrado", 404);

        agentesRepository.remove(index);
        res.status(204).send();
    } catch (error) {
        next(error);
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
