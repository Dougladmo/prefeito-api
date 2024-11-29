const jwt = require("jsonwebtoken");
const AdmUser = require("../models/AdmUser");

// Middleware para capturar o ID do administrador a partir do token
exports.adminMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extrai o token do header Authorization

  if (!token) {
    return res.status(401).json({ msg: "Acesso não autorizado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADM_SECRET); // Verifica o token usando a chave secreta
    const adminUser = await AdmUser.findById(decoded.id); // Busca o administrador pelo ID

    if (!adminUser) {
      return res.status(404).json({ msg: "Administrador não encontrado." });
    }

    // Adiciona o ID do administrador ao corpo da requisição
    req.body.adminUserId = adminUser._id;
    next(); // Chama o próximo middleware ou rota
  } catch (error) {
    console.error(error);
    return res.status(403).json({ msg: "Token inválido." });
  }
};
