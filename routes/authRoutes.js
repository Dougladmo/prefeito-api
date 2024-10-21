const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const admUserController = require("../controllers/admUserController");
const checkToken = require("../middlewares/authMiddleware");

// Rotas de autenticação para usuários comuns
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// Rota para reenvio de e-mail de verificação de usuários comuns
router.post("/resend-verification-email", userController.resendVerificationEmail);

// Rota para reenvio de e-mail de redefinição de senha para usuários comuns
router.post("/resend-reset-password-email", userController.resendResetPasswordEmail);

// Rotas de autenticação para administradores
router.post("/adm/register", admUserController.register);
router.post("/adm/login", admUserController.login);
router.post("/adm/forgot-password", admUserController.forgotPassword);
router.post("/adm/reset-password/:token", admUserController.resetPassword);

// Rota para reenvio de e-mail de verificação para administradores
router.post("/adm/resend-verification-email", admUserController.resendVerificationEmail);

// Rota para reenvio de e-mail de redefinição de senha para administradores
router.post("/adm/resend-reset-password-email", admUserController.resendResetPasswordEmail);

// Rotas de verificação de email
router.get("/verify-email/user/:token", userController.verifyEmail); // Para usuários comuns
router.get("/verify-email/adm/:token", admUserController.verifyEmail); // Para administradores

// Rota privada para buscar usuário
router.get("/users/:id", checkToken, userController.getUser);

// Rota privada para buscar administrador
router.get("/adm/users/:id", checkToken, admUserController.getUser);

module.exports = router;
