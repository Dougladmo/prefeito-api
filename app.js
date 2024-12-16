require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require('cors'); // Importando o CORS

const app = express();

app.use(cors());


app.use(express.json());

connectDB();

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/reports", reportRoutes);

const cityRoutes = require("./routes/cityRoutes");
app.use("/city", cityRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo à API" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
