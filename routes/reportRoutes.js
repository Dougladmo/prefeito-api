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
const upload = require('../middlewares/uploadMiddleware'); // Middleware de upload de imagens

// Rotas para GuardReport
router.get('/guardReports', getAllReports); // Obter todos os relatórios de guardReport
router.get('/guardReport/:id', getReportById); // Obter relatório de guardReport por ID
router.get('/guardReports/user/:userId', getReportsByUserId); // Obter relatórios de guardReport por userId
router.post('/guardReport', reportsMiddleware, createReport); // Criar um novo relatório de guardReport com middleware
router.put('/guardReport/:id', updateReportById); // Atualizar relatório de guardReport por ID
router.delete('/guardReport/:id', deleteReportById); // Deletar relatório de guardReport por ID

// Rotas para TrafficReport
router.get('/trafficReports', getAllTrafficReports); // Obter todos os relatórios de trânsito
router.get('/trafficReport/:id', getTrafficReportById); // Obter relatório de trânsito por ID
router.get('/trafficReports/user/:userId', getTrafficReportsByUserId); // Obter relatórios de trânsito por userId
router.post('/trafficReport', reportsMiddleware, upload.single('image'), createTrafficReport); // Criar relatório de trânsito com upload de imagem
router.put('/trafficReport/:id', updateTrafficReportById); // Atualizar relatório de trânsito por ID
router.delete('/trafficReport/:id', deleteTrafficReportById); // Deletar relatório de trânsito por ID

// Rotas para PublicLightingReport
router.get('/publicLightingReports', getAllPublicLightingReports); // Obter todos os relatórios de iluminação pública
router.get('/publicLightingReport/:id', getPublicLightingReportById); // Obter relatório de iluminação pública por ID
router.get('/publicLightingReports/user/:userId', getPublicLightingReportsByUserId); // Obter relatórios de iluminação pública por userId
router.post('/publicLightingReport', reportsMiddleware, upload.single('image'), createPublicLightingReport); // Criar relatório de iluminação pública com upload de imagem
router.put('/publicLightingReport/:id', updatePublicLightingReportById); // Atualizar relatório de iluminação pública por ID
router.delete('/publicLightingReport/:id', deletePublicLightingReportById); // Deletar relatório de iluminação pública por ID

// Nova rota para obter todos os relatórios de um usuário específico
router.get('/user/:userId', getAllReportsByUserId); // Obter todos os relatórios de um usuário específico

// Rotas para UserFeedback
router.post('/feedback', reportsMiddleware, userFeedbackController.createFeedback); // Criar um novo feedback
router.get('/feedback', userFeedbackController.getAllFeedbacks); // Obter todos os feedbacks

module.exports = router;
