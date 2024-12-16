const mongoose = require('mongoose');

const AdmUser = mongoose.model('AdmUser', {
  name: String,
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
});

module.exports = AdmUser;
