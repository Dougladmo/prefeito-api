const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação para usuários comuns
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword); // Envia o código de 6 dígitos
router.post("/reset-password", userController.resetPassword); // Redefine a senha com o código de 6 dígitos
router.post("/verify-email/user", userController.verifyEmail); // Verifica o email com o código
router.post("/resend-verification-email", userController.resendVerificationEmail);

// Rota para reenvio de e-mail de redefinição de senha para administradores
router.post("/adm/resend-reset-password-email", admUserController.resendResetPasswordEmail);

// Rota privada para buscar usuário
router.get("/users", checkToken, userController.getUser);

module.exports = router;
