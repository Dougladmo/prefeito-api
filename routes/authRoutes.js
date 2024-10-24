const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const admUserController = require("../controllers/admUserController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação para usuários comuns
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword); // Envia o código de 6 dígitos
router.post("/reset-password", userController.resetPassword); // Redefine a senha com o código de 6 dígitos
router.post("/verify-email/user", userController.verifyEmail); // Verifica o email com o código

// Rotas de autenticação para administradores
router.post("/adm/register", admUserController.register);
router.post("/adm/login", admUserController.login);
router.post("/adm/forgot-password", admUserController.forgotPassword); // Envia o código de 6 dígitos
router.post("/adm/reset-password", admUserController.resetPassword); // Redefine a senha com o código de 6 dígitos
router.post("/adm/verify-email", admUserController.verifyEmail); // Verifica o email com o código

// Rota para reenvio de e-mail de verificação para administradores
router.post("/adm/resend-verification-email", admUserController.resendVerificationEmail);

// Rota para reenvio de e-mail de redefinição de senha para administradores
router.post("/adm/resend-reset-password-email", admUserController.resendResetPasswordEmail);

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

// Rota privada para buscar administrador
router.get("/adm/users/:id", checkToken, admUserController.getUser);

module.exports = router;
