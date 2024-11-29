const mongoose = require('mongoose');

// Definindo o esquema de PublicLightingReport
const publicLightingReportSchema = new mongoose.Schema({
  type: { 
    type: String,
  },
  description: { 
    type: String, 
    required: true 
  },
  location: {
    type: String,
  },
  statusReport: { 
    type: String, 
    enum: ["pendente", "em andamento", "resolvido"], // Status geral do relatório
    default: "pendente" 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  image: { 
    type: String, // URL da imagem do relatório
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }, 
});

// Criando o modelo
const PublicLightingReport = mongoose.model('PublicLightingReport', publicLightingReportSchema);

module.exports = PublicLightingReport;
