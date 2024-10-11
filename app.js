require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS

app.use(express.json())

const User = require('./models/User')

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API" });
});

app.post('auth/register', async(req, res) => {
  const { name, email, password, confirmPassword } = req.body

  if (!name) {
    return res.status(422).json({msg: 'O nome é obrigatório'})
  }
  if (!email) {
    return res.status(422).json({msg: 'O email é obrigatório'})
  }
  if (!password) {
    return res.status(422).json({msg: 'A senha é obrigatória'})
  }
  if (password !== confirmPassword) {
    return res.status(422).json({msg: 'As senhas não conferem'})
  }

  const userExists = await User.findOne( { email: email } )
  if(userExists) {
    return res.status(422).json({msg: 'o Email utilizado já esta cadastrado'})
  }

})

mongoose
  .connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.wiwdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => {
    app.listen(3000);
    console.log('BD Conectado.')
  })
  .catch((err) => console.log(err));
