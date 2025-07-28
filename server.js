const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares que devem vir primeiro
app.use(express.json());

// Importação correta respetando case-sensitive
const agentesRoutes = require('./routes/agentesRoutes');
const casosRoutes = require('./routes/casosRoutes');

// Uso dos middlewares de rota
app.use('/agentes', agentesRoutes);
app.use('/casos', casosRoutes);

// Importação e uso do Swagger (docs)
const { swaggerUi, swaggerSpec } = require('./docs/swagger');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz para checagem
app.get('/', (req, res) => {
  res.send('API do Departamento de Polícia está rodando!');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚓 Servidor rodando em http://localhost:${PORT}`);
});
