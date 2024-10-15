require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware para parse de JSON
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Importar rotas
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

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
