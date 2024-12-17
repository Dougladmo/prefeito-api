const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportById,
  deleteReportById,
  getReportsByUserId
} = require('../controllers/guardReportController');

const {
  createTrafficReport,
  getAllTrafficReports,
  getTrafficReportById,
  updateTrafficReportById,
  deleteTrafficReportById,
  getTrafficReportsByUserId
} = require('../controllers/trafficReportController');

const {
  createPublicLightingReport,
  getAllPublicLightingReports,
  getPublicLightingReportById,
  updatePublicLightingReportById,
  deletePublicLightingReportById,
  getPublicLightingReportsByUserId
} = require('../controllers/PublicLightingReport');

// Importando o controller de relatórios do usuário
const { getAllReportsByUserId } = require('../controllers/userReportsController');

// Importando o controller de feedback do usuário
const userFeedbackController = require('../controllers/UserFeedbackController');

const { reportsMiddleware } = require('../middlewares/reportsMiddleware'); // Middleware para validações de relatório

// Rotas para GuardReport
router.get('/guardReports', getAllReports); // Obter todos os relatórios de guardReport
router.get('/guardReport/:id', getReportById); // Obter relatório de guardReport por ID
router.get('/guardReports/user', reportsMiddleware, getReportsByUserId); // Obter relatórios de guardReport por userId (agora usando o middleware para pegar userId do token)
router.post('/guardReport', reportsMiddleware, createReport); // Criar um novo relatório de guardReport com middleware
router.put('/guardReport/:id', updateReportById); // Atualizar relatório de guardReport por ID
router.delete('/guardReport/:id', deleteReportById); // Deletar relatório de guardReport por ID

// Rotas para TrafficReport
router.get('/trafficReports', getAllTrafficReports); // Obter todos os relatórios de trânsito
router.get('/trafficReport/:id', getTrafficReportById); // Obter relatório de trânsito por ID
router.get('/trafficReports/user', reportsMiddleware, getTrafficReportsByUserId); // Obter relatórios de trânsito por userId (agora usando o middleware para pegar userId do token)
router.post('/trafficReport', reportsMiddleware, createTrafficReport); // Criar relatório de trânsito com upload de imagem
router.put('/trafficReport/:id', updateTrafficReportById); // Atualizar relatório de trânsito por ID
router.delete('/trafficReport/:id', deleteTrafficReportById); // Deletar relatório de trânsito por ID

// Rotas para PublicLightingReport
router.get('/publicLightingReports', getAllPublicLightingReports); // Obter todos os relatórios de iluminação pública
router.get('/publicLightingReport/:id', getPublicLightingReportById); // Obter relatório de iluminação pública por ID
router.get('/publicLightingReports/user', reportsMiddleware, getPublicLightingReportsByUserId); // Obter relatórios de iluminação pública por userId (agora usando o middleware para pegar userId do token)
router.post('/publicLightingReport', reportsMiddleware, createPublicLightingReport); // Criar relatório de iluminação pública com upload de imagem
router.put('/publicLightingReport/:id', updatePublicLightingReportById); // Atualizar relatório de iluminação pública por ID
router.delete('/publicLightingReport/:id', deletePublicLightingReportById); // Deletar relatório de iluminação pública por ID

// Nova rota para obter todos os relatórios de um usuário específico
router.get('/user/reports', reportsMiddleware, getAllReportsByUserId); // Obter todos os relatórios de um usuário específico (agora usando middleware para pegar userId)

// Rotas para UserFeedback
router.post('/feedback', reportsMiddleware, userFeedbackController.createFeedback); // Criar um novo feedback
router.get('/feedback', userFeedbackController.getAllFeedbacks); // Obter todos os feedbacks

module.exports = router;
