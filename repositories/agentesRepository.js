const { v4: uuidv4 } = require('uuid');

const agentes = [
    {
        "id": uuidv4(),
        "nome": "Rommel Carneiro",
        "dataDeIncorporacao": "1992-10-04",
        "cargo": "delegado"

    },
    {
        "id": uuidv4(),
        "nome": "Aloana Silva",
        "dataDeIncorporacao": "2024-05-15",
        "cargo": "investigadora"
    },
    {
        "id": uuidv4(),
        "nome": "Carlos Souza",
        "dataDeIncorporacao": "2010-03-20",
        "cargo": "agente"
    },
    {
        "id": uuidv4(),
        "nome": "Fernanda Lima",
        "dataDeIncorporacao": "2012-07-30",
        "cargo": "perita"
    },
    {
        "id": uuidv4(),
        "nome": "João Pereira",
        "dataDeIncorporacao": "2018-11-10",
        "cargo": "escrivão"
    },
    {
        "id": uuidv4(),
        "nome": "Mariana Costa",
        "dataDeIncorporacao": "2020-01-05",
        "cargo": "agente"
    },
    {
        "id": uuidv4(),
        "nome": "Roberto Alves",
        "dataDeIncorporacao": "2021-06-15",
        "cargo": "investigador"
    },
    {
        "id": uuidv4(),
        "nome": "Patrícia Rocha",
        "dataDeIncorporacao": "2019-09-25",
        "cargo": "agente"
    },
    {
        "id": uuidv4(),
        "nome": "Lucas Martins",
        "dataDeIncorporacao": "2022-02-18",
        "cargo": "delegado"
    }
]

function findAll() {
    return agentes
}

function add(agente) {
    agentes.push(agente);
}

function update(id, { nome, dataDeIncorporacao, cargo }) {
    const agente = agentes.find(agente => agente.id === id)
    if (!agente) return null

    agente.nome = nome
    agente.dataDeIncorporacao = dataDeIncorporacao
    agente.cargo = cargo

    return agente
}

function remove(index) {
    agentes.splice(index, 1);
}

function findById(id) {
    return agentes.find(agente => agente.id === id) 
}

function partialUpdateAgente(id, updates){
    const agente = agentes.find(agente => agente.id === id)
    
    if(!agente)
        return null

    delete updates.id

    Object.keys(updates).forEach(prop => {
        if(updates[prop] !== undefined)
            agente[prop] = updates[prop]
    })

    return agente
}

module.exports = {
    findAll,
    add,
    update,
    remove,
    findById,
    partialUpdateAgente
}