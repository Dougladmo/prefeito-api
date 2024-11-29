const GuardReport = require('../models/guardReport');
const TrafficReport = require('../models/trafficReport');
const PublicLightingReport = require('../models/publicLightingReport');

exports.getAllReportsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Verificar se o userId é válido
    if (!userId) {
      return res.status(400).json({ error: 'User ID não fornecido' });
    }

    // Buscar relatórios de Guard
    const guardReports = await GuardReport.find({ userId }).exec();

    // Buscar relatórios de Trânsito
    const trafficReports = await TrafficReport.find({ userId }).exec();

    // Buscar relatórios de Iluminação Pública
    const publicLightingReports = await PublicLightingReport.find({ userId }).exec();

    // Criar um objeto para consolidar os relatórios
    const reports = {
      guardReports,
      trafficReports,
      publicLightingReports,
    };

    // Retornar os relatórios encontrados
    res.status(200).json(reports);
  } catch (error) {
    console.error('Erro ao buscar relatórios do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar os relatórios.' });
  }
};
