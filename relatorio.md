<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 3 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **74.6/100**

Olá, Aloana! 👋🚓 Que alegria revisar seu código! Primeiramente, parabéns pelo esforço e pela organização do projeto! 🎉 Você estruturou bem seu backend, separando rotas, controllers e repositories, o que é fundamental para um projeto escalável e fácil de manter. Vamos celebrar juntos suas conquistas e também explorar alguns pontos que podem te levar ao próximo nível! 💪✨

---

## 🎉 Pontos Fortes que Merecem Destaque

- **Estrutura modular impecável!** Você distribuiu muito bem as responsabilidades entre `routes`, `controllers` e `repositories`. Isso deixa seu código limpo e alinhado com boas práticas.
- **Validações feitas com carinho:** Vi que você usou a biblioteca `uuid` para validar IDs e o `moment` para validar datas, o que é ótimo para garantir a integridade dos dados.
- **Tratamento de erros personalizado:** Você já retorna mensagens claras e status HTTP adequados para várias situações, como 400 para dados inválidos e 404 para recursos não encontrados.
- **Filtros e ordenação nos endpoints:** Implementou filtros por status e agente nos casos, e filtros por nome, cargo e datas nos agentes, com ordenação. Isso mostra que você entendeu bem a importância de endpoints flexíveis.
- **Bônus conquistados:** Você conseguiu implementar filtros de casos por status e agente, e também fez a ordenação por data de incorporação em agentes — isso é um diferencial! 👏

---

## 🔎 Análise Detalhada dos Pontos que Precisam de Atenção

### 1. Falhas ao buscar agente inexistente (404) e caso por ID inválido (404)

Você já trata bem o status 400 para IDs inválidos com `uuidValidate`. Porém, percebi que quando você faz a busca por ID e não encontra o recurso, o retorno 404 funciona para agentes:

```js
const agente = agentesRepository.findAll().find(a => a.id === id);
if (agente) {
    res.json(agente);
} else {
    res.status(404).send({ message: "Agente não encontrado" });
}
```

Mas para casos, você tem:

```js
const caso = casosRepository.findAll().find(c => c.id === id);
if (caso) {
    res.json(caso);
} else {
    res.status(404).send({ message: "Caso não encontrado" });
}
```

Aqui está correto. Então, o problema pode estar em algum detalhe no teste ou em como o ID inválido é passado. Como você já valida o formato do ID, isso está OK.

**Sugestão:** Certifique-se de que o ID passado no teste ou na requisição realmente não existe no array. Se quiser garantir, pode criar um ID fixo para testes inexistentes e usar ele.

---

### 2. PATCH em agente com payload inválido (400)

Você tem uma validação bacana no `partialUpdateAgente` para checar se o payload é um objeto não vazio:

```js
if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
    return res.status(400).send({ message: "Payload vazio ou inválido" });
}
```

Isso está ótimo! Também impede alteração do `id`:

```js
if ('id' in updates) delete updates.id;
```

No entanto, as penalidades indicam que você ainda permite alterar o ID do agente via PUT e PATCH. Como isso é um problema grave, vamos focar nisso.

---

### 3. Penalidades: Consegue alterar ID do agente com PUT e PATCH, e ID do caso com PUT

**Aqui está o ponto mais crítico!** 🚨

No seu código do controller, você tenta impedir alteração do `id` com:

```js
if ('id' in updatedAgente) delete updatedAgente.id;
```

No PUT e PATCH para agentes, e similar para casos. Porém, isso só remove a propriedade do objeto que veio no corpo da requisição, mas não impede que o ID original seja substituído ao atualizar o array.

Por exemplo, no `updateAgente`:

```js
updatedAgente.id = id; // Você está sobrescrevendo o id que veio no body com o id do path param
agentesRepository.update(index, updatedAgente);
```

Isso é correto e deveria impedir alteração do ID. Então, por que a penalidade?

**Hipótese:** Talvez o problema seja que no PATCH, você está fazendo:

```js
const updatedAgente = { ...agente, ...updates, id };
agentesRepository.update(index, updatedAgente);
```

Aqui você também força o `id` correto, o que é ótimo.

Já no `partialUpdateCaso`, você faz:

```js
Object.assign(caso, updates);
res.json(caso);
```

**Aqui está o problema!** Você está alterando o objeto `caso` diretamente com `Object.assign`, mas não está impedindo que o `id` seja alterado, nem está sobrescrevendo o `id` original depois. Além disso, você remove o `id` do `updates` antes, mas não força o `id` original após a atualização.

**Isso pode permitir que o `id` do caso seja alterado via PATCH, o que não pode!**

**Solução para o `partialUpdateCaso`:**

Altere para algo assim:

```js
if ('id' in updates) delete updates.id;

Object.assign(caso, updates);
caso.id = id; // força o id original
res.json(caso);
```

Assim, o ID do caso não será alterado.

---

### 4. Falha ao criar caso com ID de agente inválido/inexistente (404)

No seu `createCaso`, você faz validação correta do agente:

```js
if (!uuidValidate(newCaso.agente_id)) {
    return res.status(400).send({ message: "ID do agente inválido" });
}

const agenteExiste = agentesRepository.findAll().some(a => a.id === newCaso.agente_id);
if (!agenteExiste) {
    return res.status(404).send({ message: "Agente responsável não encontrado" });
}
```

Isso está perfeito! Se você recebe 404 ao criar caso com agente inexistente, é sinal de que o código está correto. Se o teste falha, pode ser por algum detalhe no envio do ID (ex: maiúsculas/minúsculas, espaços).

**Dica:** Verifique se o ID do agente passado no teste realmente não existe no seu array de agentes. Você pode criar um ID fixo para teste de agente inexistente.

---

### 5. Falhas no filtro de casos por keywords no título/descrição e filtros mais complexos em agentes

Você implementou filtro de `keyword` em casos:

```js
if (keyword) {
    const kw = keyword.toLowerCase();
    casos = casos.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(kw)) ||
        (c.descricao && c.descricao.toLowerCase().includes(kw))
    );
}
```

Isso está correto e deveria funcionar.

Já para agentes, o filtro por data de incorporação com sorting tem algumas nuances:

```js
if (dataDeIncorporacao && !dataInicial && !dataFinal) {
    agentes = agentes.filter(a => a.dataDeIncorporacao === dataDeIncorporacao);
}

if (dataInicial || dataFinal) {
    agentes = agentes.filter(a => {
        const data = a.dataDeIncorporacao;
        let after = true, before = true;

        if (dataInicial)
            after = data >= dataInicial;
        if (dataFinal)
            before = data <= dataFinal;
        return after && before;
    });
}
```

Aqui, `data` e os parâmetros são strings no formato `"YYYY-MM-DD"`. Comparar strings funciona para datas ISO, mas pode ser mais seguro usar `moment` para comparar datas, evitando erros sutis.

**Sugestão:** Use `moment` para comparar datas, por exemplo:

```js
const data = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
const inicio = dataInicial ? moment(dataInicial, 'YYYY-MM-DD') : null;
const fim = dataFinal ? moment(dataFinal, 'YYYY-MM-DD') : null;

let after = !inicio || data.isSameOrAfter(inicio, 'day');
let before = !fim || data.isSameOrBefore(fim, 'day');

return after && before;
```

Assim você garante que o filtro funcione corretamente em todos os casos.

---

### 6. Organização do Projeto

Sua estrutura de arquivos está muito boa e condiz com o esperado:

```
server.js
routes/
controllers/
repositories/
docs/
utils/
package.json
```

Parabéns por seguir esse padrão! Isso facilita muito a manutenção e escalabilidade do projeto.

---

## 💡 Recomendações de Aprendizado para Você

- Para reforçar a validação e tratamento de erros HTTP, recomendo dar uma olhada neste artigo da MDN sobre [Status 400](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400) e [Status 404](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404).
- Para aprofundar no uso de middlewares e roteamento no Express, veja este vídeo super didático: https://youtu.be/RSZHvQomeKE
- Para entender melhor manipulação de arrays (filter, find, map), que são a base do seu repositório em memória, este vídeo é excelente: https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI
- Sobre comparação e validação de datas com Moment.js, recomendo revisar a documentação oficial: https://momentjs.com/docs/#/query/is-same-or-after/

---

## 📝 Resumo dos Principais Pontos para Melhorar

- **Impeça alteração do ID dos recursos em todas as operações PUT e PATCH**, especialmente no `partialUpdateCaso` onde o ID pode estar sendo alterado sem restrição. Sempre force o ID do path param após atualizar o objeto.
- **Use Moment.js para comparar datas no filtro de agentes**, garantindo que filtros por intervalo de datas funcionem corretamente.
- **Verifique se os IDs usados para testes de inexistência realmente não estão no array**, para garantir que o 404 seja retornado corretamente.
- **Continue aprimorando as mensagens de erro personalizadas**, tornando a API mais amigável e clara para quem consome.
- **Mantenha o padrão de arquitetura modular**, que você já está fazendo muito bem!

---

Aloana, você está no caminho certo! 🚀 Seu código mostra que você compreende os conceitos fundamentais de APIs RESTful e Express.js, e com pequenos ajustes, sua API vai ficar ainda mais robusta e profissional. Continue praticando, testando e explorando! Estou aqui torcendo pelo seu sucesso! 🙌💙

Se precisar de qualquer ajuda para entender algum ponto, não hesite em chamar! Vamos juntos nessa jornada de aprendizado! 👩‍💻👨‍💻

Um abraço forte e até a próxima revisão! 🤗✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>