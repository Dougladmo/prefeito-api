const { Expo } = require('expo-server-sdk');
const { dynamoDB } = require("../config/db");

const expo = new Expo();

exports.sendNotificationAllUsers = async (req, res) => {
  try {
    const params = {
      TableName: "User",
    };

    const result = await dynamoDB.scan(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(400).json({ error: "Nenhum token encontrado na tabela de usuários" });
    }

    const tokens = result.Items.map((user) => user.pushToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Nenhum token válido encontrado" });
    }

    const { notificationTitle, notificationBodyMessage, notificationData } = req.notificationBodyMessage;

    const messages = tokens
      .map((token) => {
        if (!Expo.isExpoPushToken(token)) {
          console.error(`Token inválido: ${token}`);
          return null;
        }

        return {
          to: token,
          sound: "default",
          notificationTitle,
          notificationBodyMessage,
          notificationData,
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

exports.findBirthdayUsersAndNotify = async (req, res) => {
  try {
    const today = new Date();
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const params = {
      TableName: "User",
    };

    const result = await dynamoDB.scan(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "Nenhum usuário encontrado" });
    }

    const birthdayUsers = result.Items.filter((user) => {
      if (user.birthDate) {
        const [month, day] = user.birthDate.split("-");
        const userMonthDay = `${month}-${day}`;
        return userMonthDay === currentMonthDay;
      }
      return false;
    });

    if (birthdayUsers.length === 0) {
      return res.status(404).json({ message: "Nenhum usuário faz aniversário hoje" });
    }

    const tokens = birthdayUsers
      .map((user) => user.pushToken)
      .filter((token) => Expo.isExpoPushToken(token));

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Nenhum token válido encontrado para os usuários de aniversário" });
    }

    const notificationTitle = "🎉 Feliz Aniversário!";
    const notificationBodyMessage = "Que seu dia seja repleto de alegria e momentos especiais. Parabéns!";
    const notificationData = { message: "birthday-notification" };

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      notificationTitle,
      notificationBodyMessage,
      notificationData,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(`Erro ao enviar notificação: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Notificações de aniversário enviadas com sucesso",
      notifiedUsers: birthdayUsers.map((user) => ({
        name: user.name,
        email: user.Email,
      })),
      tickets,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar notificações de aniversário" });
  }
};

