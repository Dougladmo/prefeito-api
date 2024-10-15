const PublicLightingReport = require('../models/publicLightingReport');

// Criar um novo PublicLightingReport
exports.createPublicLightingReport = async (req, res) => {
  try {
    const newPublicLightingReport = new PublicLightingReport(req.body);
    await newPublicLightingReport.save();
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
