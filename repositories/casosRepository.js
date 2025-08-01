const { v4: uuidv4 } = require('uuid');
const agentesRepository = require('./agentesRepository');

const agentes = agentesRepository.findAll();

const casos = [
    {
        id: uuidv4(),
        titulo: "homicidio",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
        status: "aberto",
        agente_id: agentes[0] ? agentes[0].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "furto",
        descricao: "Relato de furto de veículo na região central, ocorrido na madrugada do dia 12/07/2007.",
        status: "solucionado",
        agente_id: agentes[1] ? agentes[1].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "roubo",
        descricao: "Roubo a mão armada registrado no bairro Jardim, às 15:45 do dia 13/07/2007.",
        status: "aberto",
        agente_id: agentes[2] ? agentes[2].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "sequestro",
        descricao: "Caso de sequestro relatado no bairro Primavera, com a vítima sendo resgatada às 10:00 do dia 14/07/2007.",
        status: "solucionado",
        agente_id: agentes[3] ? agentes[3].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "vandalismo",
        descricao: "Ato de vandalismo em escola pública registrado no dia 15/07/2007, com danos significativos ao patrimônio.",
        status: "aberto",
        agente_id: agentes[4] ? agentes[4].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "tráfico de drogas",
        descricao: "Operação policial contra tráfico de drogas realizada no dia 16/07/2007, resultando na apreensão de substâncias ilícitas.",
        status: "solucionado",
        agente_id: agentes[5] ? agentes[5].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "assalto a banco",
        descricao: "Assalto a banco ocorrido no dia 17/07/2007, com reféns sendo mantidos por várias horas.",
        status: "solucionado",
        agente_id: agentes[6] ? agentes[6].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "extorsão",
        descricao: "Caso de extorsão relatado no dia 18/07/2007, envolvendo ameaças a uma empresa local.",
        status: "aberto",
        agente_id: agentes[7] ? agentes[7].id : uuidv4()
    },
    {
        id: uuidv4(),
        titulo: "homicídio culposo",
        descricao: "Acidente de trânsito resultando em morte, registrado no dia 19/07/2007.",
        status: "solucionado",
        agente_id: agentes[8] ? agentes[8].id : uuidv4()
    }
];

console.log(casos);


function findAll() {
    return casos
}

function add(caso) {
    casos.push(caso);
}

function update(index, casoAtualizado) {
    casos[index] = casoAtualizado;
}

function remove(index) {
    casos.splice(index, 1);
}

module.exports = {
    findAll,
    add,
    update,
    remove
}
