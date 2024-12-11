const TrafficReport = require('../models/trafficReport');
const sgMail = require("@sendgrid/mail");

// Configurando a API do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Criar um novo TrafficReport
exports.createTrafficReport = async (req, res) => {
  try {
    const newTrafficReport = new TrafficReport({
      ...req.body, // Usando o corpo da requisição
      userId: req.body.userId // Adicionando o ID do usuário ao novo relatório
    });
    await newTrafficReport.save();

    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Relatório de Trânsito - Detalhes",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Detalhes do Relatório de Trânsito</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 120px; margin-bottom: 20px;">
            
            <h1 style="color: #333; font-size: 24px; text-align: center;">Detalhes do Relatório de Trânsito</h1>
            
            <div style="margin-top: 20px; border-top: 2px solid #007bff; padding-top: 20px;">
              <p style="font-size: 16px; color: #555;">ID do Relatório: <strong>${newTrafficReport._id}</strong></p>
              <p style="font-size: 16px; color: #555;">Tipo: <strong>${newTrafficReport.type}</strong></p>
              <p style="font-size: 16px; color: #555;">Descrição: <strong>${newTrafficReport.description}</strong></p>
              <p style="font-size: 16px; color: #555;">Localização: <strong>${newTrafficReport.location}</strong></p>
              <p style="font-size: 16px; color: #555;">Status: <strong>${newTrafficReport.statusReport}</strong></p>
              <p style="font-size: 16px; color: #555;">Data: <strong>${new Date(newTrafficReport.date).toLocaleString('pt-BR')}</strong></p>
            </div>
            
            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              <h2 style="font-size: 20px; color: #007bff;">Imagem do Relatório</h2>
              <img src="${newTrafficReport.image}" alt="Imagem do Relatório" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-top: 10px;">
            </div>
    
            <div style="margin-top: 30px; font-size: 14px; color: #555;">
              <p style="text-align: center;">Se você tiver problemas com o seu relatório ou precisar de mais informações, entre em contato conosco.</p>
              <p style="text-align: center;">Atenciosamente,<br>Equipe de Suporte</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    

    await sgMail.send(msg);

    res.status(201).json(newTrafficReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obter todos os TrafficReports
exports.getAllTrafficReports = async (req, res) => {
  try {
    const trafficReports = await TrafficReport.find();
    res.status(200).json(trafficReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter um TrafficReport por ID
exports.getTrafficReportById = async (req, res) => {
  try {
    const trafficReport = await TrafficReport.findById(req.params.id);
    if (!trafficReport) {
      return res.status(404).json({ message: 'Relatório de Trânsito não encontrado' });
    }
    res.status(200).json(trafficReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter todos os TrafficReports de um usuário específico
exports.getTrafficReportsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Obtém o userId da rota
    const trafficReports = await TrafficReport.find({ userId }); // Consulta os relatórios com o userId especificado

    if (trafficReports.length === 0) {
      return res.status(404).json({ message: 'Nenhum relatório encontrado para este usuário.' });
    }

    res.status(200).json(trafficReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar um TrafficReport por ID
exports.updateTrafficReportById = async (req, res) => {
  try {
    const updatedTrafficReport = await TrafficReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedTrafficReport) {
      return res.status(404).json({ message: 'Relatório de Trânsito não encontrado' });
    }
    res.status(200).json(updatedTrafficReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar um TrafficReport por ID
exports.deleteTrafficReportById = async (req, res) => {
  try {
    const deletedTrafficReport = await TrafficReport.findByIdAndDelete(req.params.id);
    if (!deletedTrafficReport) {
      return res.status(404).json({ message: 'Relatório de Trânsito não encontrado' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
