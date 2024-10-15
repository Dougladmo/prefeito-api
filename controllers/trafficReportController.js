const TrafficReport = require('../models/trafficReport');

// Criar um novo TrafficReport
exports.createTrafficReport = async (req, res) => {
  try {
    const newTrafficReport = new TrafficReport(req.body);
    await newTrafficReport.save();
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
