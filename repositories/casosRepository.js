const casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "homicidio",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
        status: "aberto",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1" 
    
    },
    {
        id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
        titulo: "furto",
        descricao: "Relato de furto de veículo na região central, ocorrido na madrugada do dia 12/07/2007.",
        status: "solucionado",
        agente_id: "12345678-1234-1234-1234-123456789012"
    },
    {
        id: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
        titulo: "roubo",
        descricao: "Roubo a mão armada registrado no bairro Jardim, às 15:45 do dia 13/07/2007.",
        status: "aberto",
        agente_id: "23456789-2345-2345-2345-234567890123"
    },
    {
        id: "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
        titulo: "sequestro",
        descricao: "Caso de sequestro relatado no bairro Primavera, com a vítima sendo resgatada às 10:00 do dia 14/07/2007.",
        status: "solucionado",
        agente_id: "34567890-3456-3456-3456-345678901234"
    },
    {
        id: "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
        titulo: "vandalismo",
        descricao: "Ato de vandalismo em escola pública registrado no dia 15/07/2007, com danos significativos ao patrimônio.",
        status: "aberto",
        agente_id: "45678901-4567-4567-4567-456789012345"
    },
    {
        id: "e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0",
        titulo: "tráfico de drogas",
        descricao: "Operação policial contra tráfico de drogas realizada no dia 16/07/2007, resultando na apreensão de substâncias ilícitas.",
        status: "solucionado",
        agente_id: "56789012-5678-5678-5678-567890123456"
    },
    {
        id: "f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1",
        titulo: "assalto a banco",
        descricao: "Assalto a banco ocorrido no dia 17/07/2007, com reféns sendo mantidos por várias horas.",
        status: "solucionado",
        agente_id: "67890123-6789-6789-6789-678901234567"
    },
    {
        id: "g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2",
        titulo: "extorsão",
        descricao: "Caso de extorsão relatado no dia 18/07/2007, envolvendo ameaças a uma empresa local.",
        status: "aberto",
        agente_id: "78901234-7890-7890-7890-789012345678"
    },
    {
        id: "h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3",
        titulo: "homicídio culposo",
        descricao: "Acidente de trânsito resultando em morte, registrado no dia 19/07/2007.",
        status: "solucionado",
        agente_id: "89012345-8901-8901-8901-890123456789"
    },
    {
        id: "i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4",
        titulo: "lesão corporal",
        descricao: "Caso de lesão corporal registrado no dia 20/07/2007, envolvendo briga entre vizinhos.",
        status: "solucionado",
        agente_id: "90123456-9012-9012-9012-901234567890"
    }
]

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
