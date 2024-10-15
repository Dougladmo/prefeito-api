const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação
router.post("/register", userController.register);
router.post("/login", userController.login);      
router.post("/forgot-password", userController.forgotPassword); // Rota para solicitar recuperação de senha
router.post("/reset-password/:token", userController.resetPassword); // Rota para redefinir senha

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

module.exports = router;
