require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

app.use(express.json());

const User = require("./models/User");

// Private Route

app.get("/users/:id", checkToken, async (req, res) => {

  const id = req.params.id

  const user = await User.findById(id, '-password')

  if (!user) {
    return res.status(422).json({ msg: "Usuário não cadastrado" });
  }

  res.status(200).json({ user })

})

const checkToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]

  if(!token) {
    return res.status(401).json({ msg: 'Acesso negado' })
  }

  try {

    const secret = process.env.SECRET

    jwt.verify(token, secret)

    next()
  } catch (error) {
    return res.status(400).json({ msg: 'Token inválido' })
  }

}

// Login de usuário
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(422).json({ msg: "Usuário não cadastrado" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha incorreta!" });
  }

  try {
    
   const secret = process.env.SECRET
   
   const token = jwt.sign(
    {
      id: user._id,
    },
    secret,
   )

   res.status(200).json( { msg: 'Logado com sucesso!', token } )

  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal error",
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API" });
});

// Cadastro usuário
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "o Email digitado já esta cadastrado" });
  }

  const salt = await bcrypt.genSalt(12);
  const PasswordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: PasswordHash,
  });

  try {
    await user.save();
    res.status(201).json({
      msg: "Usuário criado com sucesso",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal error",
    });
  }
});

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.wiwdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("BD Conectado.");
  })
  .catch((err) => console.log(err));
