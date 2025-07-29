<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 2 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **56.6/100**

# Feedback para Aloana 🚓✨

Olá, Aloana! Tudo bem? Primeiro, quero te parabenizar pelo esforço e pela entrega da API para o Departamento de Polícia! 🎉 Você conseguiu implementar muitos dos requisitos fundamentais, e isso é um baita passo para dominar o desenvolvimento de APIs com Node.js e Express.js. Vamos juntos analisar seu código para que você possa aprimorar ainda mais seu projeto e alcançar a excelência! 🚀

---

## 🎯 Pontos Fortes — Você mandou muito bem!

- Sua **estrutura de diretórios** está organizada conforme o esperado, com pastas separadas para `routes`, `controllers`, `repositories`, `utils` e `docs`. Isso é fundamental para manter o projeto escalável e fácil de manter. 👏

- Os endpoints principais para `/agentes` e `/casos` estão implementados com todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE). Você usou o `express.Router()` corretamente para modularizar as rotas.

- A validação básica de dados está presente, com checagem de campos obrigatórios e uso do `uuid` para validar IDs.

- Você implementou filtros e ordenação em alguns endpoints, o que mostra um cuidado extra com a usabilidade da API. Isso é um diferencial!

- Parabéns pelos bônus que você conseguiu: filtro por status e agente em casos, por exemplo. Isso é um ótimo sinal de que você está indo além do básico! 🎉

---

## 🔍 Pontos para melhorar — Vamos destravar juntos!

### 1. Tratamento de erros: o `next` está faltando nos controllers

Ao analisar seus controllers (`agentesController.js` e `casosController.js`), percebi que você usa blocos `try/catch` e chama `next(err)` para passar o erro para o middleware de tratamento, o que é ótimo. Porém, em várias funções, o parâmetro `next` não está declarado, por exemplo:

```js
async function getAllAgentes(req, res) {
    try {
        // ...
    } catch (err) {
        next(err);  // <-- Aqui o next não foi recebido como parâmetro!
    }
}
```

Isso vai gerar um erro porque o `next` não está definido no escopo da função. O correto é declarar o `next` como terceiro parâmetro da função:

```js
async function getAllAgentes(req, res, next) {
    try {
        // ...
    } catch (err) {
        next(err);
    }
}
```

Esse detalhe é crucial para que seu middleware de tratamento de erros funcione e retorne os status codes corretos (400, 404, etc). Sem isso, seu servidor pode travar ou retornar erros genéricos. 

**Recomendo fortemente revisar todos os seus controllers e garantir que todas as funções que usam `try/catch` recebam o parâmetro `next`.**

📚 Para entender melhor o fluxo de middleware e tratamento de erros no Express, veja este vídeo:  
https://youtu.be/Bn8gcSQH-bc?si=Df4htGoVrV0NR7ri

---

### 2. Validação e alteração indevida do campo `id` nos recursos

Você recebeu penalidades porque é possível alterar o campo `id` de agentes e casos via métodos PUT e PATCH, o que não deve acontecer. O `id` é um identificador único e imutável do recurso.

No seu código, você tenta proteger isso com:

```js
if ('id' in updatedAgente) delete updatedAgente.id;
```

Mas isso só remove o campo do objeto que você recebeu, não impede que o cliente envie o campo no payload. Além disso, no método PATCH para casos, você faz:

```js
Object.assign(casos[index], updates);
casos[index].id = id;
```

Aqui você sobrescreve o objeto diretamente, o que pode permitir que o `id` seja alterado antes da linha que força o id correto. Isso pode gerar inconsistências.

Para evitar isso, sugiro que você:

- Valide logo no início do método se o payload contém a propriedade `id` e retorne erro 400 caso sim, ao invés de simplesmente deletar. Isso deixa claro para o cliente que não pode alterar o `id`.

Exemplo:

```js
if ('id' in req.body) {
    throw new AppError("Não é permitido alterar o ID do recurso", 400);
}
```

- Ao atualizar o objeto, sempre garanta que o `id` do recurso original seja mantido, e não permita mudanças.

Esse cuidado evita bugs difíceis de rastrear e mantém a integridade dos seus dados.

📚 Para aprofundar em validação de dados e tratamento de erros, recomendo:  
https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_  
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400

---

### 3. Filtros e buscas incompletos ou com erros

Você implementou filtros legais, mas alguns testes bônus falharam, indicando que:

- O filtro para buscar agente responsável por caso não está funcionando corretamente.

- A filtragem por palavras-chave (`keyword`) em casos não está funcionando como esperado.

- Filtros complexos para agentes por data de incorporação e ordenação também não passaram.

Ao olhar seu código em `casosController.js`:

```js
if (keyword) {
    const kw = keyword.toLowerCase();
    casos = casos.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(kw)) ||
        (c.descricao && c.descricao.toLowerCase().includes(kw))
    );
}
```

Está correto, mas você lança erro 404 se não encontrar casos:

```js
if (casos.length === 0) {
    throw new AppError("Nenhum caso encontrado para os filtros aplicados.", 404);
}
```

Esse comportamento pode não ser esperado para filtros; geralmente retornamos um array vazio com status 200 para indicar que a busca foi feita, mas não encontrou resultados. Verifique se essa lógica está alinhada com o que o desafio pede.

Além disso, para o filtro por agente responsável, verifique se está usando o campo correto e se o parâmetro de query está sendo tratado de forma consistente (`agente_id`).

No controlador de agentes, o filtro por data usa `moment` corretamente, mas vale revisar se o formato das datas está sempre consistente e se a ordenação está funcionando para todos os campos.

📚 Para entender melhor filtros e ordenação em APIs REST, veja:  
https://youtu.be/RSZHvQomeKE (parte sobre query params e status codes)  
https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI (manipulação de arrays)

---

### 4. Validação de payloads incompletos ou mal formatados

Alguns testes indicam que seu código não está retornando 400 para payloads com formato incorreto (por exemplo, um corpo vazio ou sem os campos obrigatórios).

No seu código, você verifica campos obrigatórios, mas não vejo validação explícita para o caso do corpo ser vazio ou não ser um objeto válido.

Exemplo do `createAgente`:

```js
const newAgente = req.body;

if (!newAgente.nome || !newAgente.dataDeIncorporacao || !newAgente.cargo) {
    throw new AppError("Dados do agente incompletos", 400);
}
```

Se `req.body` for `undefined` ou não for um objeto, isso pode gerar erros inesperados. Recomendo validar logo no início se o corpo da requisição é um objeto não vazio:

```js
if (!newAgente || typeof newAgente !== 'object' || Array.isArray(newAgente) || Object.keys(newAgente).length === 0) {
    throw new AppError("Payload vazio ou inválido", 400);
}
```

Essa validação deve ser feita em todos os métodos que recebem corpo (POST, PUT, PATCH).

📚 Para aprender mais sobre validação de dados em APIs Node.js, confira:  
https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

---

### 5. Organização do middleware de tratamento de erros no `server.js`

No seu `server.js`, você importa e usa o middleware `errorHandler` da pasta `utils`, o que é ótimo:

```js
app.use(errorHandler);
```

Porém, ele está sendo chamado **depois** do `app.listen()`. Isso não é um problema funcional, mas por convenção e clareza, o middleware de erro deve ser registrado **antes** do servidor começar a ouvir as requisições, para garantir que todas as rotas e middlewares estejam configurados.

Sugestão:

```js
// Rotas e middlewares aqui...

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚓 Servidor rodando em http://localhost:${PORT}`);
});
```

Isso ajuda a evitar confusão e mantém o fluxo do Express mais claro.

---

## 📚 Recursos recomendados para você, Aloana!

- **Express.js Routing e Middleware:**  
https://expressjs.com/pt-br/guide/routing.html

- **Arquitetura MVC em Node.js:**  
https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

- **Validação e tratamento de erros em APIs:**  
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404  
https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- **Manipulação de Arrays em JavaScript:**  
https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

---

## 📝 Resumo rápido para focar:

- ✅ Declare o parâmetro `next` em todos os controllers que usam `try/catch` para repassar erros ao middleware.

- ✅ Impeça que o campo `id` seja modificado via PUT ou PATCH, retornando erro 400 caso o cliente tente.

- ✅ Revise os filtros e buscas para garantir que funcionem conforme esperado e que o retorno para filtros sem resultados seja adequado.

- ✅ Valide o corpo da requisição para garantir que não esteja vazio ou mal formado antes de processar.

- ✅ Ajuste a ordem da chamada do middleware de erro no `server.js` para antes do `app.listen()`.

---

Aloana, você está no caminho certo! Seu projeto já tem uma base muito boa, e com esses ajustes, sua API vai ficar muito mais robusta e profissional. Continue praticando, revisando e testando seu código — a experiência é o que te levará ao próximo nível! 🚀✨

Se precisar de ajuda para implementar alguma dessas correções, pode me chamar! Estou aqui para te ajudar a crescer. 💪😊

Um abraço de Code Buddy! 🤖💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>