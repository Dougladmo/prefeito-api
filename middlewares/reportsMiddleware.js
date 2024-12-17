const jwt = require("jsonwebtoken");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

// Configuração do DynamoDB
const dynamoDb = DynamoDBDocument.from(new DynamoDB());

exports.reportsMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extrai o token do header Authorization

  if (!token) {
    return res.status(401).json({ msg: "Acesso não autorizado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET); // Verifica o token usando a chave secreta
    const { email } = decoded; // Obtém o email do usuário a partir do token

    // Pesquisa o usuário no DynamoDB pelo email
    const params = {
      TableName: "User",  // Nome da tabela no DynamoDB
      Key: {
        email: email,  // Utilizando o email do usuário
      },
    };

    const result = await dynamoDb.get(params);

    if (!result.Item) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Adiciona o ID do usuário ao corpo da requisição (usando o email como chave)
    req.body.userId = result.Item.id;  // Supondo que o id esteja no campo "id" no DynamoDB
    next(); // Chama o próximo middleware ou rota
  } catch (error) {
    console.error(error);
    return res.status(403).json({ msg: "Token inválido." });
  }
};
