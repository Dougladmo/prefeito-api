const { Expo } = require('expo-server-sdk');
const { dynamoDB } = require("../config/db");

const expo = new Expo();

exports.sendNotificationAllUsers = async (req, res) => {
  try {
    const params = {
      TableName: "User",
    };

    const result = await dynamoDB.scan(params).promise();

    if (!result.Items || result.Items.length === 0) {
      return res.status(400).json({ error: "Nenhum token encontrado na tabela de usuários" });
    }

    const tokens = result.Items.map((user) => user.pushToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Nenhum token válido encontrado" });
    }

    const { title, body, data } = req.body;

    const messages = tokens
      .map((token) => {
        if (!Expo.isExpoPushToken(token)) {
          console.error(`Token inválido: ${token}`);
          return null;
        }

        return {
          to: token,
          sound: "default",
          title,
          body,
          data,
        };
      })
      .filter(Boolean); 

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar notificações" });
  }
};
