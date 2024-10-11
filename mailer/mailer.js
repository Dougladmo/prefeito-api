const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // ou outro serviço de e-mail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `http://yourapp.com/reset-password/${token}`; // URL para redefinição
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Redefinição de Senha",
    text: `Clique no link para redefinir sua senha: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };
