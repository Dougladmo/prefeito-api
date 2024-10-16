const mongoose = require('mongoose');

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false }, // Adiciona campo de verificação email
  verificationToken: { type: String }, // Armazena o token de verificação email
});

module.exports = User;
