const mongoose = require('mongoose');

// Definindo o esquema de PublicLightingReport
const publicLightingReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      "troca-de-postes", 
      "troca-de-lampadas"
    ], // Tipos permitidos para PublicLightingReport
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
});

// Criando o modelo
const PublicLightingReport = mongoose.model('PublicLightingReport', publicLightingReportSchema);

module.exports = PublicLightingReport;
