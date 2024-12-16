const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Verifica se a pasta 'uploads' existe, e cria caso não exista
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do armazenamento local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define o diretório de destino para os uploads
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gera um nome único para o arquivo usando timestamp e um identificador aleatório
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para garantir que apenas imagens sejam enviadas
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
  cb(null, true);
};

// Configurações do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Limite de 5MB para o tamanho da imagem
});

module.exports = upload;
