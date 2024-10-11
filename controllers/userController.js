const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Função para registrar o usuário
exports.register = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ msg: "Todos os campos são obrigatórios" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "O Email já está cadastrado" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Função para login do usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ msg: "Email e senha são obrigatórios" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha incorreta!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);

    res.status(200).json({ msg: "Logado com sucesso!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Função para rota privada
exports.getUser = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado" });
  }

  res.status(200).json({ user });
};
