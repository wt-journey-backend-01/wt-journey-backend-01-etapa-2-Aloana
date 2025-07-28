const agentes = [
    {
        "id": "401bccf5-cf9e-489d-8412-446cd169a0f1",
        "nome": "Rommel Carneiro",
        "dataDeIncorporacao": "1992/10/04",
        "cargo": "delegado"

    },
    {
        "id": "12345678-1234-1234-1234-123456789012",
        "nome": "Aloana Silva",
        "dataDeIncorporacao": "2024/05/15",
        "cargo": "investigadora"
    },
    {
        "id": "23456789-2345-2345-2345-234567890123",
        "nome": "Carlos Souza",
        "dataDeIncorporacao": "2010/03/20",
        "cargo": "agente"
    },
    {
        "id": "34567890-3456-3456-3456-345678901234",
        "nome": "Fernanda Lima",
        "dataDeIncorporacao": "2012/07/30",
        "cargo": "perita"
    },
    {
        "id": "45678901-4567-4567-4567-456789012345",
        "nome": "João Pereira",
        "dataDeIncorporacao": "2018/11/10",
        "cargo": "escrivão"
    },
    {
        "id": "56789012-5678-5678-5678-567890123456",
        "nome": "Mariana Costa",
        "dataDeIncorporacao": "2020/01/05",
        "cargo": "agente"
    },
    {
        "id": "67890123-6789-6789-6789-678901234567",
        "nome": "Roberto Alves",
        "dataDeIncorporacao": "2021/06/15",
        "cargo": "investigador"
    },
    {
        "id": "78901234-7890-7890-7890-789012345678",
        "nome": "Patrícia Rocha",
        "dataDeIncorporacao": "2019/09/25",
        "cargo": "agente"
    },
    {
        "id": "89012345-8901-8901-8901-890123456789",
        "nome": "Lucas Martins",
        "dataDeIncorporacao": "2022/02/18",
        "cargo": "delegado"
    }
]

function findAll() {
    return agentes
}

function add(agente) {
    agentes.push(agente);
}

function update(index, agenteAtualizado) {
    agentes[index] = agenteAtualizado;
}

function remove(index) {
    agentes.splice(index, 1);
}

module.exports = {
    findAll,
    add,
    update,
    remove
}