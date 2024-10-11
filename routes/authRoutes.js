const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação
router.post("/register", userController.register);  // Sem o prefixo /auth
router.post("/login", userController.login);        // Sem o prefixo /auth
router.post("/forgot-password", userController.forgotPassword); // Rota para solicitar recuperação de senha
router.post("/reset-password", userController.resetPassword);   // Rota para redefinir senha

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

module.exports = router;
