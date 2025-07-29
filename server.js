const express = require('express');
const { errorHandler } = require('./utils/errorHandler');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const agentesRoutes = require('./routes/agentesRoutes');
const casosRoutes = require('./routes/casosRoutes');

app.use('/agentes', agentesRoutes);
app.use('/casos', casosRoutes);

const { swaggerUi, swaggerSpec } = require('./docs/swagger');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API do Departamento de Polícia está rodando!');
});

app.listen(PORT, () => {
  console.log(`🚓 Servidor rodando em http://localhost:${PORT}`);
});

app.use(errorHandler);
module.exports = app;