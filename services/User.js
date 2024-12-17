// ./services/userService.js
const { PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDBClient = require('../config/dynamoDB');

// Função para criar um usuário
const createUser = async (userData) => {
  const params = {
    TableName: 'User',
    Item: {
      _id: { S: userData._id },
      Email: { S: userData.Email },
      name: { S: userData.name },
      password: { S: userData.password },
      isVerified: { BOOL: userData.isVerified },
      verificationCode: { S: userData.verificationCode },
      verificationCodeExpires: { S: userData.verificationCodeExpires.toISOString() },
      resetPasswordCode: { S: userData.resetPasswordCode },
      resetPasswordExpires: { S: userData.resetPasswordExpires.toISOString() },
      bairro: { S: userData.bairro || '' },
      dateOfBirth: { S: userData.dateOfBirth ? userData.dateOfBirth.toISOString() : '' },
    },
  };

  try {
    const data = await dynamoDBClient.send(new PutItemCommand(params));
    return data;
  } catch (error) {
    throw new Error('Erro ao criar usuário: ' + error.message);
  }
};

// Função para obter um usuário pelo _id e Email
const getUserById = async (_id, Email) => {
  const params = {
    TableName: 'User',
    Key: {
      _id: { S: _id }, // Chave de partição
      Email: { S: Email } // Chave de ordenação (sort key)
    },
  };

  try {
    const data = await dynamoDBClient.send(new GetItemCommand(params));
    return data.Item ? data.Item : null;
  } catch (error) {
    throw new Error('Erro ao buscar usuário: ' + error.message);
  }
};

module.exports = { createUser, getUserById };
