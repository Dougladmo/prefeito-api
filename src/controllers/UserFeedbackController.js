const UserFeedback = require('../models/UserFeedback');

const userFeedbackController = {
  async createFeedback(req, res) {
    try {
      const feedback = new UserFeedback(req.body);
      await feedback.save();

      res.status(201).json({ msg: "Feedback criado com sucesso.", feedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao criar o feedback.", error });
    }
  },

  async getAllFeedbacks(req, res) {
    try {
      const feedbacks = await UserFeedback.find();
      res.status(200).json(feedbacks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao buscar feedbacks.", error });
    }
  },
};

module.exports = userFeedbackController;
