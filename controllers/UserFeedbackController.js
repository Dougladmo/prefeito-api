const { dynamoDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = "UserFeedback";

const userFeedbackController = {
  async createFeedback(req, res) {
    try {
      const {
        sportsAndLeisure,
        culture,
        education,
        health,
        safety,
        mobilityAndTraffic,
        publicWorksAndServices,
        comments
      } = req.body;

      const createdAt = new Date().toISOString();
      const feedback = {
        _id: uuidv4(),
        sportsAndLeisure,
        culture,
        education,
        health,
        safety,
        mobilityAndTraffic,
        publicWorksAndServices,
        comments,
        userID: req.body.userId,
        createdAt,
      };

      const params = {
        TableName: TABLE_NAME,
        Item: feedback,
      };

      await dynamoDB.put(params);

      res.status(201).json({ msg: "Feedback criado com sucesso.", feedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao criar o feedback.", error });
    }
  },

  async getAllFeedbacks(req, res) {
    try {
      const params = {
        TableName: TABLE_NAME,
      };

      const result = await dynamoDB.scan(params).promise();
      res.status(200).json(result.Items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao buscar feedbacks.", error });
    }
  },
};

module.exports = userFeedbackController;
