const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema({
  sportsAndLeisure: { type: Number, required: true },
  culture: { type: Number, required: true },
  education: { type: Number, required: true },
  health: { type: Number, required: true },
  safety: { type: Number, required: true },
  mobilityAndTraffic: { type: Number, required: true },
  publicWorksAndServices: { type: Number, required: true },
  comments: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const UserFeedback = mongoose.model('UserFeedback', userFeedbackSchema);
module.exports = UserFeedback;
