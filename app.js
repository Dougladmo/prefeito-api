require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware para parse de JSON
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Importar rotas
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Configuração do multer para armazenamento local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define a pasta onde as imagens serão salvas
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Define o nome do arquivo com um timestamp para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configura o multer com o armazenamento
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB por arquivo
});

// Criando pasta 'uploads' se não existir
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const reportRoutes = require("./routes/reportRoutes");
app.use("/reports", reportRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo à API" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
