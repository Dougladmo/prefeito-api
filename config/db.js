const mongoose = require("mongoose");

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS

const connectDB = async () => {
  try {
    mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.wiwdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Conectado ao MongoDB");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB;
