const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

// Configuração do cliente do DynamoDB
const dynamoDBClient = new DynamoDBClient({
  region: 'sa-east-1',  // Defina a região explicitamente
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDB = DynamoDBDocument.from(dynamoDBClient);

const connectDB = () => {
  try {
    console.log("Conectado ao DynamoDB!");
  } catch (error) {
    console.error("Erro ao conectar ao DynamoDB:", error);
    process.exit(1);
  }
};

module.exports = { dynamoDB, connectDB };
