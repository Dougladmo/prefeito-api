const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação
router.post("/register", userController.register);  // Sem o prefixo /auth
router.post("/login", userController.login);        // Sem o prefixo /auth

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

module.exports = router;
