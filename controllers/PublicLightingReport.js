const { dynamoDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  SESClient,
  SendEmailCommand,
} = require("@aws-sdk/client-ses"); // Importando os comandos do SES SDK v3

const TABLE_NAME = "publicLightingReport";

// Criação do cliente SES
const sesClient = new SESClient({
  region: "sa-east-1", // Substitua pela região do seu SES
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function sendEmailWithSES(report) {
  const params = {
    Destination: {
      ToAddresses: ["douglas.moura.c2a@gmail.com"],
    },
    Message: {
      Subject: {
        Data: "Relatório do aplicativo - Detalhes",
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Detalhes do Relatório do aplicativo</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 120px; margin-bottom: 20px;">
                
                <h1 style="color: #333; font-size: 24px; text-align: center;">Detalhes do Relatório de Trânsito</h1>
                
                <div style="margin-top: 20px; border-top: 2px solid #007bff; padding-top: 20px;">
                  <p style="font-size: 16px; color: #555;">ID do Relatório: <strong>${report._id}</strong></p>
                  <p style="font-size: 16px; color: #555;">Tipo: <strong>${report.type}</strong></p>
                  <p style="font-size: 16px; color: #555;">Descrição: <strong>${report.description}</strong></p>
                  <p style="font-size: 16px; color: #555;">Localização: <strong>${report.location}</strong></p>
                  <p style="font-size: 16px; color: #555;">Status: <strong>${report.statusReport}</strong></p>
                  <p style="font-size: 16px; color: #555;">Data: <strong>${new Date(report.date).toLocaleString('pt-BR')}</strong></p>
                </div>
                
                <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                  <h2 style="font-size: 20px; color: #007bff;">Imagem do Relatório</h2>
                  <img src="${report.image}" alt="Imagem do Relatório" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-top: 10px;">
                </div>
        
                <div style="margin-top: 30px; font-size: 14px; color: #555;">
                  <p style="text-align: center;">Se você tiver problemas com o seu relatório ou precisar de mais informações, entre em contato conosco.</p>
                  <p style="text-align: center;">Atenciosamente,<br>Equipe de Suporte</p>
                </div>
              </div>
            </body>
            </html>
          `,
        },
      },
    },
    Source: process.env.EMAIL_USER, // Substitua pelo e-mail de envio
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log("Email enviado com sucesso!", data);
  } catch (err) {
    console.error("Erro ao enviar o email:", err);
  }
}

exports.createPublicLightingReport = async (req, res) => {
  try {
    const newReport = {
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      userId: req.body.userId,
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      statusReport: req.body.statusReport,
      image: req.body.image,
      date: req.body.date,
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: newReport,
    });

    // Envia o e-mail via SES
    await sendEmailWithSES(newReport);

    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPublicLightingReports = async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await dynamoDB.scan(params);
    res.status(200).json(result.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPublicLightingReportById = async (req, res) => {
  try {
    const { id, createdAt } = req.params;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        _id: id,
        createdAt: createdAt,
      },
    };

    const result = await dynamoDB.get(params);
    if (!result.Item) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    res.status(200).json(result.Item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReportsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-index", // Nome do índice secundário global
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await dynamoDB.query(params).promise();

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ message: "Nenhum relatório encontrado para este usuário" });
    }

    res.status(200).json(result.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePublicLightingReport = async (req, res) => {
  try {
    const { id, createdAt } = req.params;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        _id: id,
        createdAt: createdAt,
      },
      UpdateExpression: "set #description = :description, #location = :location, #statusReport = :statusReport",
      ExpressionAttributeNames: {
        "#description": "description",
        "#location": "location",
        "#statusReport": "statusReport",
      },
      ExpressionAttributeValues: {
        ":description": req.body.description,
        ":location": req.body.location,
        ":statusReport": req.body.statusReport,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDB.update(params);
    res.status(200).json(result.Attributes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePublicLightingReport = async (req, res) => {
  try {
    const { id, createdAt } = req.params;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        _id: id,
        createdAt: createdAt,
      },
    };

    await dynamoDB.delete(params);

    res.status(204).json({ msg: "Relatório deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
