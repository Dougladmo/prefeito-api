const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { dynamoDB } = require("../config/db");
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({
  region: 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sendEmailWithSES = async (msg) => {
  const params = {
    Source: process.env.EMAIL_USER,
    Destination: { ToAddresses: [msg.to] },
    Message: {
      Subject: { Data: msg.subject }, 
      Body: {
        Html: { Data: msg.html }, 
        Text: { Data: msg.text || 'Por favor, verifique este e-mail em um cliente que suporte HTML.' }, 
      },
    },
  };
  
  const command = new SendEmailCommand(params);
  await ses.send(command);
};

exports.register = async (req, res) => {
  const { name, Email, password, confirmpassword, phoneNumber, birthDate, userNeighborhood } = req.body;

  if (!name || !Email || !password || !confirmpassword) {
    return res.status(422).json({ msg: 'Todos os campos são obrigatórios' });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: 'As senhas não conferem' });
  }

  try {
    const params = {
      TableName: 'User',
      IndexName: 'Email-index',
      KeyConditionExpression: 'Email = :Email',
      ExpressionAttributeValues: { ':Email': Email },
    };

    const result = await dynamoDB.query(params);
    if (result.Items && result.Items.length > 0) {
      return res.status(422).json({ msg: 'O Email já está cadastrado' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = {
      _id: uuidv4(),
      name,
      phoneNumber,
      Email,
      password: passwordHash,
      birthDate,
      userNeighborhood,
      verificationCode,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: 'User',
      Item: user,
    };

    await dynamoDB.put(putParams);

    const msg = {
      to: user.Email,
      subject: 'Verifique seu Email',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de E-mail</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffffd0; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: rgb(255, 255, 255); padding: 10px 25px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <div style="margin-bottom: 25px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <h1 style="color: #333; text-align: center; margin-top: 15px; font-size: 22px;">Confirme seu Email</h1>
              <p style="font-size: 16px; color: #555; text-align: center;">Use o código abaixo para confirmar seu email:</p>
              <h2 style="font-size: 38px; text-align: center; color: #007bff;">${verificationCode}</h2>
              <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.5;">Esse código é válido por 15 minutos.</p>
              <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.5;">Se você não solicitou essa confirmação, pode ignorar este email.</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 12px; color: #555;">Se você tiver problemas com sua conta, entre em contato conosco.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // await sendEmailWithSES(msg);

    res.status(201).json({ msg: 'Usuário criado com sucesso. Verifique seu e-mail para confirmar sua conta.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao registrar o usuário', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { Email, verificationCode } = req.body;

  if (!Email || !verificationCode) {
    return res.status(400).json({ msg: "Email e código são obrigatórios." });
  }

  try {
    const params = {
      TableName: "User",
      IndexName: "Email-index",
      KeyConditionExpression: "Email = :Email", 
      ExpressionAttributeValues: {
        ":Email": Email,
      },
    };
    
    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0 || result.Items[0].verificationCode !== verificationCode) {
      return res.status(400).json({ msg: "Código inválido ou usuário não encontrado." });
    }

    if (result.Items[0].isVerified) {
      return res.status(400).json({ msg: "E-mail já verificado." });
    }

    const user = result.Items[0]
    const partKey = user._id

    const updateParams = {
      TableName: "User",
      Key: {
        _id: partKey, // Chave de Partição
        Email: Email, // Chave de Classificação
      },
      UpdateExpression: "set isVerified = :isVerified, verificationCode = :verificationCode",
      ExpressionAttributeValues: {
        ":isVerified": true,
        ":verificationCode": null,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await dynamoDB.update(updateParams);

    res.status(200).json({ msg: "Email verificado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao verificar o e-mail." });
  }
};

exports.login = async (req, res) => {
  const { Email, password } = req.body;

  if (!Email || !password) {
    return res.status(422).json({ msg: "Email e senha são obrigatórios" });
  }

  try {
    const params = {
      TableName: "User",
      IndexName: "Email-index",
      KeyConditionExpression: "Email = :Email", 
      ExpressionAttributeValues: {
        ":Email": Email,
      },
    };

    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(422).json({ msg: "Usuário não encontrado" });
    }

    if (!result.Items[0].isVerified) {
      return res.status(403).json({ msg: "E-mail ainda não verificado. Por favor, verifique seu e-mail." });
    }

    const checkPassword = await bcrypt.compare(password, result.Items[0].password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha incorreta!" });
    }

    const secret = process.env.SECRET;
    const token = jwt.sign(
      { 
        Email: result.Items[0].Email, 
        _id: result.Items[0]._id
      },
      secret
    );
    

    res.status(200).json({ msg: "Logado com sucesso!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(422).json({ msg: "Email é obrigatório" });
  }

  try {
    const params = {
      TableName: "User",
      IndexName: "Email-index", 
      KeyConditionExpression: "Email = :Email", 
      ExpressionAttributeValues: {
        ":Email": Email, 
      },
    };

    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = result.Items[0]
    const partKey = user._id

    const updateParams = {
      TableName: "User",
      Key: {
        _id: partKey, // Chave de Partição
        Email: Email, // Chave de Classificação
      },
      UpdateExpression: "set resetCode = :resetCode",
      ExpressionAttributeValues: {
        ":resetCode": resetCode,
      },
    };

    await dynamoDB.update(updateParams);

    const msg = {
      to: result.Items[0].Email,
      subject: "Código de Recuperação de Senha",
      html: ` 
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <h1 style="font-size: 24px; color: #333;">Redefinição de Senha</h1>
            <p style="font-size: 16px; color: #555;">Use o código abaixo para redefinir sua senha:</p>
            <h2 style="font-size: 28px; text-align: center; color: #007bff;">${resetCode}</h2>
            <p style="font-size: 16px; color: #555;">Este código expirará em 15 minutos.</p>
            <p style="font-size: 16px; color: #555;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p>
          </div>
        </body>
        </html>
      `,
    };

    // await sendEmailWithSES(msg);

    res.status(200).json({ msg: "Código de recuperação enviado para o seu e-mail" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao enviar o código de recuperação" });
  }
};

exports.resetPassword = async (req, res) => {
  const { Email, resetCode, newPassword } = req.body;

  if (!Email || !resetCode || !newPassword) {
    return res.status(422).json({ msg: "Email, código de reset e nova senha são obrigatórios" });
  }

  try {
    const params = {
      TableName: "User",
      IndexName: "Email-index",
      KeyConditionExpression: "Email = :Email",
      ExpressionAttributeValues: {
        ":Email": Email,
      },
    };

    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    if (result.Items[0].resetCode !== resetCode) {
      return res.status(400).json({ msg: "Código inválido" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = result.Items[0]
    const partKey = user._id

    const updateParams = {
      TableName: "User",
      Key: {
        _id: partKey, // Chave de Partição
        Email: Email, // Chave de Classificação
      },
      UpdateExpression: "set password = :password, resetCode = :resetCode",
      ExpressionAttributeValues: {
        ":password": hashedPassword,
        ":resetCode": null,
      },
    };

    await dynamoDB.update(updateParams);

    res.status(200).json({ msg: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao redefinir a senha" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(422).json({ msg: "Email é obrigatório" });
  }

  try {
    const params = {
      TableName: "User",
      IndexName: "Email-index",
      KeyConditionExpression: "Email = :Email", 
      ExpressionAttributeValues: {
        ":Email": Email,
      },
    };

    const result = await dynamoDB.query(params);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    const user = result.Items[0]; 

    if (user.isVerified) {
      return res.status(400).json({ msg: "E-mail já verificado." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const partKey = user._id

    const updateParams = {
      TableName: "User",
      Key: {
        _id: partKey, // Chave de Partição
        Email: Email, // Chave de Classificação
      },
      UpdateExpression: "set verificationCode = :verificationCode",
      ExpressionAttributeValues: {
        ":verificationCode": verificationCode,
      },
    };

    await dynamoDB.update(updateParams);

    const msg = {
      to: user.Email,
      subject: "Verifique seu Email",
      html: ` 
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de E-mail</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffffd0; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: rgb(255, 255, 255); padding: 10px 25px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <img src="https://i.imgur.com/fNlG0zM.png" alt="logo c2a" style="width: 100px;">
            <div style="margin-bottom: 25px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <h1 style="color: #333; text-align: center; margin-top: 15px; font-size: 22px;">Confirme seu Email</h1>
              <p style="font-size: 16px; color: #555; text-align: center;">Use o código abaixo para confirmar seu email:</p>
              <h2 style="font-size: 38px; text-align: center; color: #007bff;">${verificationCode}</h2>
              <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.5;">Esse código é válido por 15 minutos.</p>
              <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.5;">Se você não solicitou essa confirmação, pode ignorar este email.</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 12px; color: #555;">Se você tiver problemas com sua conta, entre em contato conosco.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // await sendEmailWithSES(msg);

    res.status(200).json({ msg: "Email de verificação reenviado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao reenviar o email de verificação" });
  }
};

exports.getUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const partKey = decoded._id;
    const Email = decoded.Email;

    const params = {
      TableName: "User",
      Key: {
        _id: partKey,
        Email: Email,
      },
    };

    const result = await dynamoDB.get(params);

    if (!result.Item) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const user = result.Item;

    // Removendo dados sensíveis
    delete user.password;
    delete user.verificationCode;
    delete user.resetCode;

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao buscar o usuário." });
  }
};

exports.updateUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const partKey = decoded._id;
    const Email = decoded.Email;

    const params = {
      TableName: "User",
      Key: {
        _id: partKey,
        Email: Email,
      },
    };

    const result = await dynamoDB.get(params);

    if (!result.Item) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const updatedUser = { ...result.Item };

    if (!updatedUser.pushToken && req.body.pushToken) {
      updatedUser.pushToken = req.body.pushToken;
    }

    const updateParams = {
      TableName: "User",
      Item: updatedUser,
    };

    await dynamoDB.put(updateParams);

    res.status(200).json({ msg: "Usuário atualizado com sucesso.", user: updatedUser.pushToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao atualizar o usuário." });
  }
};


