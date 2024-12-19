const { dynamoDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const TABLE_NAME = 'trafficReport';

exports.createTrafficReport = async (req, res) => {
  try {
    const { type, description, location, userId, statusReport, image } = req.body;
    const createdAt = new Date().toISOString();
    const newTrafficReport = {
      _id: uuidv4(),
      userId,
      type,
      description,
      location,
      statusReport,
      image,
      createdAt,
    };

    const params = {
      TableName: TABLE_NAME,
      Item: newPublicLightingReport,
    };

    await dynamoDB.put(params).promise();

    const msg = {
      to: "douglas.moura.c2a@gmail.com",
      from: process.env.EMAIL_USER,
      subject: "Relatório do aplicativo - Detalhes",
      html: `<!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Detalhes do Relatório do aplicativo</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 120px; margin-bottom: 20px;">
              <h1 style="color: #333; font-size: 24px; text-align: center;">Detalhes do Relatório de Iluminação Pública</h1>
              <div style="margin-top: 20px; border-top: 2px solid #007bff; padding-top: 20px;">
                <p style="font-size: 16px; color: #555;">ID do Relatório: <strong>${newPublicLightingReport._id}</strong></p>
                <p style="font-size: 16px; color: #555;">Tipo: <strong>${newPublicLightingReport.type}</strong></p>
                <p style="font-size: 16px; color: #555;">Descrição: <strong>${newPublicLightingReport.description}</strong></p>
                <p style="font-size: 16px; color: #555;">Localização: <strong>${newPublicLightingReport.location}</strong></p>
                <p style="font-size: 16px; color: #555;">Status: <strong>${newPublicLightingReport.statusReport}</strong></p>
                <p style="font-size: 16px; color: #555;">Data: <strong>${new Date(newPublicLightingReport.createdAt).toLocaleString('pt-BR')}</strong></p>
              </div>
              <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                <h2 style="font-size: 20px; color: #007bff;">Imagem do Relatório</h2>
                <img src="${newPublicLightingReport.image}" alt="Imagem do Relatório" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-top: 10px;">
              </div>
              <div style="margin-top: 30px; font-size: 14px; color: #555;">
                <p style="text-align: center;">Se você tiver problemas com o seu relatório ou precisar de mais informações, entre em contato conosco.</p>
                <p style="text-align: center;">Atenciosamente,<br>Equipe de Suporte</p>
              </div>
            </div>
          </body>
        </html>`,
    };

    await sgMail.send(msg);

    res.status(201).json(newTrafficReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTrafficReports = async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDB.scan(params);
    res.status(200).json(result.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrafficReportById = async (req, res) => {
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

exports.getTrafficReportById = async (req, res) => {
   try {
       const { id,  createdAt } = req.params;
   
       const params = {
         TableName: TABLE_NAME,
         Key: {
           _id: id,
           createdAt:  createdAt,
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

exports.updateTrafficReportById = async (req, res) => {
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
        "#statusReport": "statusReport"
      },
      ExpressionAttributeValues: {
        ":description": req.body.description,
        ":location": req.body.location,
        ":statusReport": req.body.statusReport
      },
      ReturnValues: "ALL_NEW"
    };

    const result = await dynamoDB.update(params);
    res.status(200).json(result.Attributes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTrafficReportById = async (req, res) => {
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
