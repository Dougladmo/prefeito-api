const jwt = require("jsonwebtoken");
const { dynamoDB } = require("../config/db");

exports.reportsMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso não autorizado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const { Email, _id } = decoded;

    const params = {
      TableName: "User",
      Key: {
        _id: _id,
        Email: Email,
      },
    };


    const result = await dynamoDB.get(params);

    if (!result.Item) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    req.body.userId = result.Item._id;

    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ msg: "Token inválido." });
  }
};
