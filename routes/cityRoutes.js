const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController'); // Importando o newsController
const { reportsMiddleware } = require('../middlewares/reportsMiddleware'); // Importando o middleware

// Rotas para notícias da cidade
router.post('/news', reportsMiddleware, newsController.createNews); // Criar uma nova notícia
router.get('/news', newsController.getAllNews); // Obter todas as notícias
router.get('/news/:id', newsController.getNewsById); // Obter uma notícia pelo ID
router.put('/news/:id', reportsMiddleware, newsController.updateNewsById); // Atualizar uma notícia pelo ID
router.delete('/news/:id', reportsMiddleware, newsController.deleteNewsById); // Deletar uma notícia pelo ID

// (Adicione as rotas de eventos aqui se necessário)
// Exemplo:
// router.post('/events', cityEventsController.createEvent);
// router.get('/events', cityEventsController.getAllEvents);

module.exports = router;
