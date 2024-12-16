const PublicLightingReport = require('../models/publicLightingReport');
const sgMail = require("@sendgrid/mail");

// Configurando a API do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Criar um novo PublicLightingReport
exports.createPublicLightingReport = async (req, res) => {
  try {
    const newPublicLightingReport = new PublicLightingReport({
      ...req.body, // Usando o corpo da requisição
      userId: req.body.userId // Adicionando o ID do usuário ao novo relatório
    });
    await newPublicLightingReport.save();

    const msg = {
      to: "douglas.moura.c2a@gmail.com",
      from: process.env.EMAIL_USER,
      subject: "Relatório do aplicativo - Detalhes",
      html: `
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
              <p style="font-size: 16px; color: #555;">ID do Relatório: <strong>${newPublicLightingReport._id}</strong></p>
              <p style="font-size: 16px; color: #555;">Tipo: <strong>${newPublicLightingReport.type}</strong></p>
              <p style="font-size: 16px; color: #555;">Descrição: <strong>${newPublicLightingReport.description}</strong></p>
              <p style="font-size: 16px; color: #555;">Localização: <strong>${newPublicLightingReport.location}</strong></p>
              <p style="font-size: 16px; color: #555;">Status: <strong>${newPublicLightingReport.statusReport}</strong></p>
              <p style="font-size: 16px; color: #555;">Data: <strong>${new Date(newPublicLightingReport.date).toLocaleString('pt-BR')}</strong></p>
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
        </html>
      `,
    };

    await sgMail.send(msg);

    res.status(201).json(newPublicLightingReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obter todos os PublicLightingReports
exports.getAllPublicLightingReports = async (req, res) => {
  try {
    const publicLightingReports = await PublicLightingReport.find();
    res.status(200).json(publicLightingReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter um PublicLightingReport por ID
exports.getPublicLightingReportById = async (req, res) => {
  try {
    const publicLightingReport = await PublicLightingReport.findById(req.params.id);
    if (!publicLightingReport) {
      return res.status(404).json({ message: 'Relatório de Iluminação Pública não encontrado' });
    }
    res.status(200).json(publicLightingReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter todos os PublicLightingReports de um ID/Usuário específico
exports.getPublicLightingReportsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Obtém o userId da rota
    const reports = await PublicLightingReport.find({ userId }); // Consulta os relatórios com o userId especificado

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Nenhum relatório encontrado para este usuário.' });
    }

    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar um PublicLightingReport por ID
exports.updatePublicLightingReportById = async (req, res) => {
  try {
    const updatedPublicLightingReport = await PublicLightingReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPublicLightingReport) {
      return res.status(404).json({ message: 'Relatório de Iluminação Pública não encontrado' });
    }
    res.status(200).json(updatedPublicLightingReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar um PublicLightingReport por ID
exports.deletePublicLightingReportById = async (req, res) => {
  try {
    const deletedPublicLightingReport = await PublicLightingReport.findByIdAndDelete(req.params.id);
    if (!deletedPublicLightingReport) {
      return res.status(404).json({ message: 'Relatório de Iluminação Pública não encontrado' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
