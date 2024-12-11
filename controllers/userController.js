const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");

// Configurando a API do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Registro do usuário com envio de email de verificação
exports.register = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ msg: "Todos os campos são obrigatórios" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(422).json({ msg: "O Email já está cadastrado" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Gera um código de verificação aleatório
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = new User({
    name,
    email,
    password: passwordHash,
    verificationCode,
  });

  try {
    await user.save();

    // Envia email de verificação
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Verifique seu Email",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de E-mail</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffffd0; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: rgb(255, 255, 255); padding: 10px 25px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <div style="margin-bottom: 25px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <h1 style="color: #333; text-align: left; font-size: 22px;">Confirme seu Email</h1>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Use o código abaixo para confirmar seu email:</p>
              <h2 style="font-size: 28px; text-align: center; color: #007bff;">${verificationCode}</h2>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Esse código é válido por 15 minutos.</p>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Se você não solicitou essa confirmação, pode ignorar este email.</p>
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

    res.status(201).json({ msg: "Usuário criado com sucesso. Verifique seu email para confirmar sua conta." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Verificação de email
exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ msg: "Email e código são obrigatórios." });
  }

  try {
    // Busca o usuário pelo email e código de verificação
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(400).json({ msg: "Código inválido ou usuário não encontrado." });
    }

    // Verifica se o e-mail já foi verificado
    if (user.isVerified) {
      return res.status(400).json({ msg: "E-mail já verificado." });
    }

    // Atualiza o campo isVerified para true e remove o código
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ msg: "Email verificado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao verificar o e-mail." });
  }
};

// Função para login do usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ msg: "Email e senha são obrigatórios" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).json({ msg: "Usuário não encontrado" });
    }

    // Verifica se o email foi confirmado
    if (!user.isVerified) {
      return res.status(403).json({ msg: "E-mail ainda não verificado. Por favor, verifique seu e-mail." });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha incorreta!" });
    }

    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);

    res.status(200).json({ msg: "Logado com sucesso!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Função para reenvio de email de verificação
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Verifica se o email já foi verificado
    if (user.isVerified) {
      return res.status(400).json({ msg: "Email já verificado." });
    }

    // Gera um código de verificação aleatório de 6 dígitos
    const NewVerificationCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    user.verificationCode = NewVerificationCode;
    await user.save();

    // Envia o email de verificação
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Reenvio de Verificação de Email",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de E-mail</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffffd0; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: rgb(255, 255, 255); padding: 10px 25px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <div style="margin-bottom: 25px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <h1 style="color: #333; text-align: left; font-size: 22px;">Confirme seu Email</h1>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Use o código abaixo para confirmar seu email:</p>
              <h2 style="font-size: 28px; text-align: center; color: #007bff;">${NewVerificationCode}</h2>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Esse código é válido por 15 minutos.</p>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Se você não solicitou essa confirmação, pode ignorar este email.</p>
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

    res.status(200).json({ msg: "Email de verificação reenviado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao reenviar o email de verificação." });
  }
};

// Função para recuperação de senha
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

    // Gera um código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Define o tempo de expiração do código (15 minutos)
    const expires = Date.now() + 15 * 60 * 1000;

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expires;
    await user.save();

    // Envia o código de redefinição por e-mail
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
          <title>Redefinição de Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <h1 style="font-size: 24px; color: #333;">Redefinição de Senha</h1>
            <p style="font-size: 16px; color: #555;">Use o código abaixo para redefinir sua senha:</p>
            <h2 style="font-size: 28px; text-align: center; color: #007bff;">${resetCode}</h2>
            <p style="font-size: 16px; color: #555;">Este código expirará em 15 minutos.</p>
            <p style="font-size: 16px; color: #555;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ msg: "Código de redefinição enviado para o e-mail." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao enviar o e-mail." });
  }
};

// Redefinir a senha
exports.resetPassword = async (req, res) => {
  const { email, resetCode, newPassword, confirmNewPassword } = req.body;

  if (!email || !resetCode || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ msg: "Todos os campos são obrigatórios." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ msg: "As senhas não conferem." });
  }

  try {
    const user = await User.findOne({ email, resetPasswordCode: resetCode });

    if (!user) {
      return res.status(400).json({ msg: "Código de redefinição inválido." });
    }

    // Verifica se o código expirou
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ msg: "O código de redefinição expirou." });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha e remove o código de recuperação
    user.password = passwordHash;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ msg: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao redefinir a senha." });
  }
};

exports.getUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Captura o token do cabeçalho Authorization

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." });
  }

  try {

    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select("-password -verificationCode -resetPasswordCode"); 

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao buscar o usuário." });
  }
};