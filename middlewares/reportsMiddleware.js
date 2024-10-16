const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware para capturar o ID do usuário a partir do token
exports.guardReport = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extrai o token do header Authorization

  if (!token) {
    return res.status(401).json({ msg: "Acesso não autorizado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET); // Verifica o token usando a chave secreta
    const user = await User.findById(decoded.id); // Busca o usuário pelo ID

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Adiciona o ID do usuário ao corpo da requisição
    req.body.userId = user._id;
    next(); // Chama o próximo middleware ou rota
  } catch (error) {
    console.error(error);
    return res.status(403).json({ msg: "Token inválido." });
  }
};
