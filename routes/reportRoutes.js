const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportById,
  deleteReportById
} = require('../controllers/guardReportController'); // Ajuste o caminho conforme necessário

// Definindo as rotas
router.get('/guardReports', getAllReports); // Obter todos os relatórios
router.get('/guardReport/:id', getReportById); // Obter relatório por ID
router.post('/guardReport', createReport); // Criar um novo relatório
router.put('/guardReport/:id', updateReportById); // Atualizar relatório por ID
router.delete('/guardReport/:id', deleteReportById); // Deletar relatório por ID

module.exports = router;
