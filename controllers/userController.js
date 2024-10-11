const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

// Função para recuperar a senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Verifica se o e-mail foi fornecido
  if (!email) {
    return res.status(400).json({ msg: "O e-mail é obrigatório." });
  }

  try {
    // Busca o usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Cria um token de recuperação
    const secret = process.env.SECRET + user.password; // Token seguro
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '15m' });

    // Configuração do nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou outro serviço de e-mail
      auth: {
        user: process.env.EMAIL_USER, // seu e-mail
        pass: process.env.EMAIL_PASS, // sua senha
      },
    });

    const link = `http://localhost:3000/reset-password/${token}`;

    // Envio do e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperação de Senha",
      text: `Clique no link para redefinir sua senha: ${link}`,
    });

    res.status(200).json({ msg: "Email enviado com sucesso!" });
  } catch (error) {
    console.error(error); // Log do erro para depuração
    res.status(500).json({ msg: "Erro interno no servidor." });
  }
};


// Função para redefinir a senha
exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmpassword } = req.body;

  if (newPassword !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  try {
    const { id } = jwt.verify(token, process.env.SECRET + user.password); // Verifica o token
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: passwordHash });
    res.status(200).json({ msg: "Senha redefinida com sucesso!" });
  } catch (error) {
    res.status(400).json({ msg: "Token inválido ou expirado!" });
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
