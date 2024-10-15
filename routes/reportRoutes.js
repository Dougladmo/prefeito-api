const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportById,
  deleteReportById
} = require('../controllers/guardReportController');

const {
  createTrafficReport,
  getAllTrafficReports,
  getTrafficReportById,
  updateTrafficReportById,
  deleteTrafficReportById
} = require('../controllers/trafficReportController'); 

const {
  createPublicLightingReport,
  getAllPublicLightingReports,
  getPublicLightingReportById,
  updatePublicLightingReportById,
  deletePublicLightingReportById
} = require('../controllers/PublicLightingReport');

// Rotas para GuardReport
router.get('/guardReports', getAllReports); // Obter todos os relatórios de guardReport
router.get('/guardReport/:id', getReportById); // Obter relatório de guardReport por ID
router.post('/guardReport', createReport); // Criar um novo relatório de guardReport
router.put('/guardReport/:id', updateReportById); // Atualizar relatório de guardReport por ID
router.delete('/guardReport/:id', deleteReportById); // Deletar relatório de guardReport por ID

// Rotas para TrafficReport
router.get('/trafficReports', getAllTrafficReports); // Obter todos os relatórios de trânsito
router.get('/trafficReport/:id', getTrafficReportById); // Obter relatório de trânsito por ID
router.post('/trafficReport', createTrafficReport); // Criar um novo relatório de trânsito
router.put('/trafficReport/:id', updateTrafficReportById); // Atualizar relatório de trânsito por ID
router.delete('/trafficReport/:id', deleteTrafficReportById); // Deletar relatório de trânsito por ID

// Rotas para PublicLightingReport
router.get('/publicLightingReports', getAllPublicLightingReports); // Obter todos os relatórios de iluminação pública
router.get('/publicLightingReport/:id', getPublicLightingReportById); // Obter relatório de iluminação pública por ID
router.post('/publicLightingReport', createPublicLightingReport); // Criar um novo relatório de iluminação pública
router.put('/publicLightingReport/:id', updatePublicLightingReportById); // Atualizar relatório de iluminação pública por ID
router.delete('/publicLightingReport/:id', deletePublicLightingReportById); // Deletar relatório de iluminação pública por ID

module.exports = router;
