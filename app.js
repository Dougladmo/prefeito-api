require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/reports", reportRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo à API" });
});

module.exports = app;
