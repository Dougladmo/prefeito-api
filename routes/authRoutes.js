const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// Rota para verificação de email
router.get("/verify-email/:token", userController.verifyEmail);

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

module.exports = router;
