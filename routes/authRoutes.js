const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkToken } = require("../middlewares/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login); 
router.post("/forgot-password", userController.forgotPassword); 
router.post("/reset-password", userController.resetPassword); 

router.post("/verify-email", userController.verifyEmail);

router.post("/resend-verification-email", userController.resendVerificationEmail);

// Rota privada para buscar as informações do usuário
router.get("/user", checkToken, userController.getUser);

module.exports = router;
