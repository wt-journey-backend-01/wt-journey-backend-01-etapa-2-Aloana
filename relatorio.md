<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 7 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **51.3/100**

Olá, Aloana! 🚓✨

Antes de mais nada, parabéns pelo empenho e pela estruturação do seu projeto! 🎉 Você organizou seu código em pastas de forma clara — `routes`, `controllers`, `repositories` e até incluiu a documentação com Swagger. Isso é fundamental para manter o código escalável e fácil de manter. 👏 Também vi que você implementou todos os endpoints básicos para `/agentes` e `/casos` com os métodos HTTP corretos, e até cuidou da validação de alguns campos e tratamento de erros. Muito bom! 👍

---

## Vamos conversar sobre os pontos que podem te levar ao próximo nível? 🚀

### 1. Validação de Datas no Agente: cuidado com datas futuras!

No seu `agentesController.js`, você faz uma validação da data de incorporação usando o Moment.js:

```js
if (!moment(newAgente.dataDeIncorporacao, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).send({ message: "Data de incorporação inválida" });
}
```

Isso é ótimo, mas percebi que não há uma verificação para impedir que a data seja **no futuro**. Por exemplo, uma data como "2025-01-01" passaria na validação, mas não faz sentido um agente ser incorporado no futuro, né? 🤔

**Como melhorar?** Você pode comparar a data informada com a data atual e rejeitar se for maior, por exemplo:

```js
const dataIncorporacao = moment(newAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);
if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment())) {
    return res.status(400).send({ message: "Data de incorporação inválida ou futura" });
}
```

Assim, você garante que só aceita datas válidas e que já aconteceram. Isso evita inconsistências nos dados do seu sistema!

> Para entender melhor como validar datas com Moment.js, dá uma olhada aqui: https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

---

### 2. Protegendo o ID do Agente contra alterações (PUT e PATCH)

Vi que em `updateAgente` e `partialUpdateAgente` você permite que o ID do agente seja alterado, porque não está bloqueando essa alteração no corpo da requisição. Por exemplo, no `partialUpdateAgente`:

```js
const updates = req.body;
delete updates.id; // Você até tenta remover o id aqui, o que é ótimo!
const agente = agentesRepository.findAll().find(a => a.id === id);
if (agente) {
    Object.assign(agente, updates);
    res.json(agente);
} else {
    res.status(404).send({ message: "Agente não encontrado" });
}
```

Aqui você remove o `id` do objeto `updates`, o que é correto. Mas no método `updateAgente` (PUT), você não faz essa proteção:

```js
updatedAgente.id = id;
agentesRepository.update(index, updatedAgente);
res.json(updatedAgente);
```

Se alguém enviar um corpo com `id` diferente, ele será sobrescrito pela linha `updatedAgente.id = id`, o que evita a alteração — isso está correto.

Porém, no PATCH, mesmo com o `delete updates.id`, seria interessante reforçar a validação e garantir que o ID nunca seja alterado, para evitar bugs futuros.

**Minha dica:** Sempre remova ou ignore o campo `id` vindo do cliente, e use o ID da URL para identificar o registro. Assim, seu sistema fica mais seguro.

---

### 3. IDs dos Casos não são UUIDs válidos relacionados aos agentes!

No seu arquivo `repositories/casosRepository.js`, percebi que você está gerando IDs UUID para os casos, e também para o `agente_id` dentro de cada caso, mas o `agente_id` está sendo gerado com `uuidv4()` aleatoriamente, sem garantir que exista um agente com aquele ID.

```js
{
    id: uuidv4(),
    titulo: "homicidio",
    descricao: "...",
    status: "aberto",
    agente_id: uuidv4() // Aqui está o problema!
},
```

Isso significa que seus casos estão referenciando agentes que não existem no array de agentes, o que gera inconsistência e pode causar erros quando você tenta validar ou buscar casos por agente.

No seu `createCaso` você até tenta validar se o `agente_id` existe:

```js
const agenteExiste = agentesRepository.findAll().some(a => a.id === newCaso.agente_id);
if (!agenteExiste) {
    return res.status(404).send({ message: "Agente responsável não encontrado" });
}
```

Mas como os dados iniciais já estão com `agente_id` inválidos, isso pode gerar confusão.

**Como resolver?** Você pode modificar o array inicial de casos para usar IDs reais de agentes já cadastrados. Por exemplo:

```js
const agentes = agentesRepository.findAll();

const casos = [
    {
        id: uuidv4(),
        titulo: "homicidio",
        descricao: "...",
        status: "aberto",
        agente_id: agentes[0].id // Referencia um agente existente
    },
    // demais casos...
];
```

Assim, a integridade dos dados fica garantida.

---

### 4. Falta de validação no PATCH para casos (payload incorreto)

No seu controller `casosController.js`, o método `partialUpdateCaso` não está validando o payload, ou seja, se o cliente enviar dados inválidos, seu sistema aceita e atualiza o caso sem restrições:

```js
Object.assign(caso, updates);
res.json(caso);
```

Isso pode permitir que campos importantes sejam corrompidos ou que dados inválidos entrem no sistema.

No caso dos agentes, você já fez uma validação melhor, o que é ótimo! Para os casos, recomendo implementar uma validação similar para os campos que podem ser atualizados, como `titulo`, `descricao`, `status` e `agente_id`.

---

### 5. Filtros e ordenações (Bônus) ainda não implementados

Vi que você tentou implementar alguns filtros para casos e agentes, mas os testes indicam que eles ainda não estão funcionando completamente. Isso é natural, pois filtros e ordenações podem ser desafiadores no início.

Minha sugestão é começar implementando filtros simples usando `req.query` nas rotas GET, por exemplo:

```js
router.get('/', (req, res) => {
  const { status, agente_id } = req.query;
  let casos = casosRepository.findAll();

  if (status) {
    casos = casos.filter(c => c.status === status);
  }
  if (agente_id) {
    casos = casos.filter(c => c.agente_id === agente_id);
  }
  res.json(casos);
});
```

Assim você vai treinando a manipulação de arrays e queries, e deixa sua API mais poderosa!

> Para te ajudar a entender melhor filtros e query params, recomendo este vídeo: https://youtu.be/--TQwiNIw28

---

### 6. Organização e Estrutura do Projeto

Sua estrutura de diretórios está correta e segue o padrão esperado, com as pastas `routes/`, `controllers/`, `repositories/`, `docs/` e `utils/`. Isso mostra que você compreende a importância da arquitetura modular, o que é essencial para projetos Node.js mais complexos. Continue assim! 💪

---

## Resumo dos principais pontos para focar:

- 🚫 **Impedir datas futuras na criação/atualização de agentes** para manter a integridade dos dados.
- 🔒 **Proteger o campo `id` para que não seja alterado via PUT ou PATCH**, garantindo que o ID seja sempre o da URL.
- 🔗 **Corrigir os `agente_id` nos dados iniciais dos casos, para que referenciem agentes existentes** e evitar inconsistências.
- 🛡️ **Adicionar validação robusta no PATCH de casos para evitar dados inválidos.**
- 🔍 **Implementar filtros e ordenações nas rotas GET para bônus e melhor usabilidade da API.**

---

## Recursos para você crescer ainda mais! 📚

- [Validação de dados em APIs Node.js/Express](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)
- [Manipulação de Query Params e filtros no Express](https://youtu.be/--TQwiNIw28)
- [Documentação oficial do Express sobre roteamento](https://expressjs.com/pt-br/guide/routing.html)
- [Arquitetura MVC aplicada a Node.js](https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH)

---

Aloana, você está no caminho certo! 🚀 Com esses ajustes, sua API vai ficar muito mais sólida, confiável e pronta para o uso real. Continue praticando, revisando e experimentando — a prática é o que transforma código bom em código excelente! 💙

Se precisar, estou aqui para ajudar a destravar qualquer ponto. Vamos juntos! 🤜🤛

Um abraço virtual e até a próxima revisão! 👩‍💻👨‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>