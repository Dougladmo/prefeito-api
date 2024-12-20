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
  updatePublicLightingReport,
  deletePublicLightingReport,
  getPublicLightReportsByUserId
} = require('../controllers/PublicLightingReport');

const userFeedbackController = require('../controllers/UserFeedbackController');
const { reportsMiddleware } = require('../middlewares/reportsMiddleware');

router.get('/guardReports', getAllReports);
router.get('/guardReport/:id/:createdAt', getReportById);
router.get('/guardReport/:userId', getReportsByUserId);
router.post('/guardReport', reportsMiddleware, createReport);
router.put('/guardReport/:id/:createdAt', updateReportById);
router.delete('/guardReport/:id/:createdAt', deleteReportById);

router.get('/trafficReports', getAllTrafficReports);
router.get('/trafficReport/:id/:createdAt', getTrafficReportById);
router.get('/trafficReport/:userId', getTrafficReportsByUserId);
router.post('/trafficReport', reportsMiddleware, createTrafficReport);
router.put('/trafficReport/:id/:createdAt', updateTrafficReportById);
router.delete('/trafficReport/:id/:createdAt', deleteTrafficReportById);

router.get('/publicLightingReports', getAllPublicLightingReports);
router.get('/publicLightingReport/:id/:createdAt', getPublicLightingReportById);
router.get('/publicLightingReport/:userId', getPublicLightReportsByUserId);
router.post('/publicLightingReport', reportsMiddleware, createPublicLightingReport);
router.put('/publicLightingReport/:id/:createdAt', updatePublicLightingReport);
router.delete('/publicLightingReport/:id/:createdAt', deletePublicLightingReport);

router.post('/feedback', reportsMiddleware, userFeedbackController.createFeedback);
router.get('/feedback', userFeedbackController.getAllFeedbacks);

module.exports = router;
