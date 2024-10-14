const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");

// Configurando a API do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Define a chave da API do SendGrid

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

  if (!email) {
    return res.status(400).json({ msg: "O e-mail é obrigatório." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const secret = process.env.SECRET + user.password;
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "15m" });

    const link = `http://localhost:3000/auth/reset-password/${token}`;

    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Recuperação de Senha",
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #ffffffd0; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: rgb(255, 255, 255); padding: 10px 25px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
        <div style="margin-bottom: 25px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
            <h1 style="color: #333; text-align: left; font-size: 22px;">Redefina sua Senha</h1>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin: 10px 0;">Redefinir Senha</a>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">Se você não solicitou a redefinição de senha, pode ignorar este email.</p>
        </div>
        <div>
            <p style="text-align: left; font-size: 12px;">Se você tiver problemas com sua conta, entre em contato conosco.</p>
        </div>
    </div>
</body>
</html>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ msg: "Email enviado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor." });
  }
};

// Função para redefinir a senha
exports.resetPassword = async (req, res) => {
  const { newpassword, confirmpassword } = req.body;
  const { token } = req.params; // Alterado para receber o token por params

  if (newpassword !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  try {
    const decoded = jwt.decode(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    // Verifica o token com o segredo baseado na senha do usuário
    jwt.verify(token, process.env.SECRET + user.password);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newpassword, salt);

    await User.findByIdAndUpdate(user._id, { password: passwordHash });
    res.status(200).json({ msg: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error(error);
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
