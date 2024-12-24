const app = require('./app'); // Importa o app configurado
const http = require('http');

const PORT = process.env.PORT || 3000;

// Cria o servidor HTTP e escuta na porta configurada
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
