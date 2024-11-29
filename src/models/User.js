const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // Campo para armazenar o código de verificação de 6 dígitos
  verificationCodeExpires: { type: Date }, // Campo para armazenar a data de expiração do código de verificação
  resetPasswordCode: { type: String }, // Campo para armazenar o código de redefinição de senha
  resetPasswordExpires: { type: Date }, // Campo para armazenar a data de expiração do código de redefinição
});

// Exporta o modelo User
const User = mongoose.model('User', UserSchema);
module.exports = User;
