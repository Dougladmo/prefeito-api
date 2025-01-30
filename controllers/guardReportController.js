const { dynamoDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  SESClient,
  SendEmailCommand,
} = require("@aws-sdk/client-ses");
const TABLE_NAME = "guardReport";

const sesClient = new SESClient({
  region: "sa-east-1",
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
        Data: "Relatório de denúncia do aplicativo",
      },
      Body: {
        Html: {
          Data: `
                <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detalhes do Relatório do Aplicativo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header img {
          width: 120px;
          margin-bottom: 20px;
          background-color: #fff;
        }
        h1 {
          color: #333;
          font-size: 24px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #555;
        }
        .footer p {
          text-align: center;
          font-size: 14px;
          color: #555;
        }
        .img-report {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 10px;
        }
        .unsubscribe {
          font-size: 14px;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a">
        </div>
        <h1>Detalhes do Relatório de Trânsito</h1>
        <div class="content">
          <p><strong>ID do Relatório:</strong> ${report._id}</p>
          <p><strong>Tipo:</strong> ${report.type}</p>
          <p><strong>Descrição:</strong> ${report.description}</p>
          <p><strong>Localização:</strong> ${report.location}</p>
          <p><strong>Status:</strong> ${report.statusReport}</p>
          <p><strong>Data:</strong> ${new Date(report.createdAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).replace(',', ' ')}</p>
        </div>
        <div class="content">
          <h2 style="font-size: 20px; color: #007bff;">Imagem do Relatório</h2>
          <img src="${report.image}" alt="Imagem do Relatório" class="img-report">
        </div>
        <div class="footer">
          <p>Se você tiver problemas com o seu relatório ou precisar de mais informações, entre em contato conosco.</p>
          <p>Atenciosamente,<br>Equipe de Suporte<br>suporte@c2a.com.br</p>
        </div>
        <div class="unsubscribe">
          <p>Se você deseja se desinscrever da nossa lista, <a href="https://www.seusite.com/cancelar-inscricao">clique aqui</a>.</p>
        </div>
      </div>
    </body>
    </html>
          `,
        },
      },
    },
    Source: process.env.EMAIL_USER,
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log("Email enviado com sucesso!", data);
  } catch (err) {
    console.error("Erro ao enviar o email:", err);
  }
}

exports.createReport = async (req, res) => {
  const allowedStatus = ["Em andamento", "Resolvido", "Não resolvido"];

  try {
    const newReport = {
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      userId: req.body.userId,
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      Neighborhood: req.body.Neighborhood,
      statusReport: allowedStatus.includes(req.body.statusReport) ? req.body.statusReport : "Em andamento",
      image: req.body.image,
      date: req.body.date,
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: newReport,
    });

    await sendEmailWithSES(newReport);

    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
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

exports.getReportsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ message: "Nenhum relatório encontrado para este usuário" });
    }

    res.status(200).json(result.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReportById = async (req, res) => {
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

exports.updateReportById = async (req, res) => {
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

exports.deleteReportById = async (req, res) => {
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
