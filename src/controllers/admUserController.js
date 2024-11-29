const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const AdmUser = require("../models/admUser");
const crypto = require("crypto");

// Configurando a API do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Registro do administrador com envio de email de verificação
exports.register = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ msg: "Todos os campos são obrigatórios" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  const userExists = await AdmUser.findOne({ email });
  if (userExists) {
    return res.status(422).json({ msg: "O Email já está cadastrado" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Gera um token de verificação aleatório
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = new AdmUser({
    name,
    email,
    password: passwordHash,
    verificationToken, // Armazena o token
  });

  try {
    await user.save();

    // Envia email de verificação
    const verificationLink = `http://localhost:3000/auth/verify-email/adm/${verificationToken}`;
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Verifique seu Email",
      html: 
      `
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
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Clique no botão abaixo para confirmar seu email:</p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin: 10px 0;">Confirmar Email</a>
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
    
    res.status(201).json({ msg: "Usuário Administrador criado com sucesso. Verifique seu email para confirmar sua conta." });
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
    const user = await AdmUser.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário Administrador não encontrado." });
    }

    // Verifica se o email já foi verificado
    if (user.isVerified) {
      return res.status(400).json({ msg: "Email já verificado." });
    }

    // Gera um novo token de verificação
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Gera o link de verificação
    const verificationLink = `http://localhost:3000/auth/verify-email/adm/${verificationToken}`;

    // Envia o email de verificação
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Reenvio de Verificação de Email",
      html: 
      `
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
              <p style="font-size: 16px; color: #555; line-height: 1.5;">Clique no botão abaixo para confirmar seu email:</p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin: 10px 0;">Confirmar Email</a>
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

// Verificação de email
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log("Token recebido:", token); // Log do token recebido

  try {
    // Busca o usuário Administrador pelo token
    const user = await AdmUser.findOne({ verificationToken: token });
    console.log("Usuário Administrador encontrado:", user); // Log do usuário Administrador encontrado

    if (!user) {
      return res.status(400).json({ msg: "Token inválido." });
    }

    // Verifica se o e-mail já foi verificado
    if (user.isVerified) {
      return res.status(400).json({ msg: "E-mail já verificado." });
    }

    // Atualiza o campo isVerified para true e remove o token
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ msg: "Email verificado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao verificar o e-mail." });
  }
};


// Função para login do administrador
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ msg: "Email e senha são obrigatórios" });
  }

  try {
    const user = await AdmUser.findOne({ email });
    
    if (!user) {
      return res.status(422).json({ msg: "Usuário Administrador não encontrado" });
    }

    // Verifica se o email foi confirmado
    if (!user.isVerified) {
      return res.status(403).json({ msg: "E-mail ainda não verificado. Por favor, verifique seu e-mail." });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha incorreta!" });
    }

    const secret = process.env.ADM_SECRET;
    const token = jwt.sign({ id: user._id }, secret);

    res.status(200).json({ msg: "Logado com sucesso!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Função para recuperação de senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "O e-mail é obrigatório." });
  }

  try {
    const user = await AdmUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Usuário Administrador não encontrado." });
    }

    const secret = process.env.ADM_SECRET;
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "15m" });

    const link = `http://localhost:3000/auth/adm/reset-password/${token}`;

    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Recuperação de Senha",
      html: 
      `
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
            <p style="font-size: 16px; color: #555;">Clique no link abaixo para redefinir sua senha:</p>
            <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin: 10px 0;">Redefinir Senha</a>
            <p style="font-size: 16px; color: #555;">Se você não solicitou uma redefinição de senha, pode ignorar este e-mail.</p>
            <p style="font-size: 14px; color: #999;">Este link expirará em 15 minutos.</p>
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
  const { token } = req.params;

  if (!newpassword || !confirmpassword) {
    return res.status(400).json({ msg: "Preencha todos os campos." });
  }

  if (newpassword !== confirmpassword) {
    return res.status(400).json({ msg: "As senhas não conferem." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADM_SECRET);
    const user = await AdmUser.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuário Administrador não encontrado." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newpassword, salt);
    await user.save();

    res.status(200).json({ msg: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor." });
  }
};

// Função para obter administrador autenticado
exports.getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await AdmUser.findById(id, "-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuário Administrador não encontrado" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

// Função para reenviar email de redefinição de senha
exports.resendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório." });
  }

  try {
    const user = await AdmUser.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário Administrador não encontrado." });
    }

    // Gera um novo token de redefinição de senha
    const secret = process.env.ADM_SECRET;
    const resetToken = jwt.sign({ id: user._id }, secret, { expiresIn: "15m" });

    const resetLink = `http://localhost:3000/auth/adm/reset-password/${resetToken}`;

    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Reenvio de Redefinição de Senha",
      html: 
      `
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
            <p style="font-size: 16px; color: #555;">Clique no link abaixo para redefinir sua senha:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin: 10px 0;">Redefinir Senha</a>
            <p style="font-size: 16px; color: #555;">Se você não solicitou uma redefinição de senha, pode ignorar este e-mail.</p>
            <p style="font-size: 14px; color: #999;">Este link expirará em 15 minutos.</p>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ msg: "Email de redefinição de senha reenviado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao reenviar o email de redefinição de senha." });
  }
};
