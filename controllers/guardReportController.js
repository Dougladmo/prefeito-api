const GuardReport = require('../models/guardReport');

// Criar um novo GuardReport
exports.createReport = async (req, res) => {
  try {
    const newReport = new GuardReport(req.body);
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obter todos os GuardReports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await GuardReport.find();
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter um GuardReport por ID
exports.getReportById = async (req, res) => {
  try {
    const report = await GuardReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar um GuardReport por ID
exports.updateReportById = async (req, res) => {
  try {
    const updatedReport = await GuardReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedReport) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar um GuardReport por ID
exports.deleteReportById = async (req, res) => {
  try {
    const deletedReport = await GuardReport.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
