const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const { dynamoDB } = require("../config/db");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.register = async (req, res) => {
  const { name, Email, password, confirmpassword } = req.body;

  if (!name || !Email || !password || !confirmpassword) {
    return res.status(422).json({ msg: "Todos os campos são obrigatórios" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
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
    if (result.Items && result.Items.length > 0) {
      return res.status(422).json({ msg: "O Email já está cadastrado" });
    }
    
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = {
      _id: uuidv4(),
      name,
      Email,
      password: passwordHash,
      verificationCode,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Salva o usuário no DynamoDB
    const putParams = {
      TableName: "User", 
      Item: user,
    };

    await dynamoDB.put(putParams);

    const msg = {
      to: user.Email,
      from: process.env.EMAIL_USER,
      subject: "Verifique seu Email",
      html: ` 
        <html>
          <body>
            <h1>Confirme seu Email</h1>
            <p>Use o código abaixo para confirmar seu Email:</p>
            <h2>${verificationCode}</h2>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    res.status(201).json({ msg: "Usuário criado com sucesso. Verifique seu Email para confirmar sua conta." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro interno no servidor" });
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

    const updateParams = {
      TableName: "User",
      Key: {
        Email: Email,
      },
      UpdateExpression: "set isVerified = :isVerified, verificationCode = :verificationCode",
      ExpressionAttributeValues: {
        ":isVerified": true,
        ":verificationCode": null,
      },
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
    const token = jwt.sign({ Email: result.Items[0].Email }, secret);

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

    const updateParams = {
      TableName: "User",
      Key: {
        Email: Email,
      },
      UpdateExpression: "set resetCode = :resetCode",
      ExpressionAttributeValues: {
        ":resetCode": resetCode,
      },
    };

    await dynamoDB.update(updateParams);

    const msg = {
      to: result.Items[0].Email,
      from: process.env.EMAIL_USER,
      subject: "Código de Recuperação de Senha",
      html: ` 
        <html>
          <body>
            <h1>Código de Recuperação de Senha</h1>
            <p>Use o código abaixo para redefinir sua senha:</p>
            <h2>${resetCode}</h2>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg);

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

    const updateParams = {
      TableName: "User",
      Key: {
        Email: Email, 
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

    const updateParams = {
      TableName: "User",
      Key: {
        Email: Email,
      },
      UpdateExpression: "set verificationCode = :verificationCode",
      ExpressionAttributeValues: {
        ":verificationCode": verificationCode,
      },
    };

    await dynamoDB.update(updateParams);

    const msg = {
      to: user.Email,
      from: process.env.EMAIL_USER,
      subject: "Verifique seu Email",
      html: ` 
        <html>
          <body>
            <h1>Confirme seu Email</h1>
            <p>Use o código abaixo para confirmar seu Email:</p>
            <h2>${verificationCode}</h2>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ msg: "Email de verificação reenviado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao reenviar o email de verificação" });
  }
};

exports.getUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ msg: "Token não fornecido" });
  }

  try {
    
    const decoded = verifyToken(token); 
    const userId = decoded._id;

    const params = {
      TableName: "User",
      Key: {
        _id: userId,
      },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    const user = result.Item;
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.Email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao obter os dados do usuário" });
  }
};