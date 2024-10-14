const mongoose = require('mongoose');

// Definindo o esquema de GuardReport
const guardReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["pichacao", "descarte-irregular", "ocupacao-area-publica"], // Tipos permitidos para GuardReport
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    lat: { type: Number, required: true }, // Latitude
    lng: { type: Number, required: true }  // Longitude
  },
  status: { 
    type: String, 
    enum: ["pendente", "em andamento", "resolvido"], // Status permitidos
    default: "pendente" 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  image: { 
    type: String, // URL ou caminho da imagem do relatório
    required: true // Pode ser opcional, dependendo do uso
  },
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Referência ao modelo de usuário
    required: true 
  }
});

// Criando o modelo
const GuardReport = mongoose.model('GuardReport', guardReportSchema);

module.exports = GuardReport;
