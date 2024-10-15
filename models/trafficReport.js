const mongoose = require('mongoose');

// Definindo o esquema de TrafficReport
const trafficReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      "semaforo-desligado", 
      "semaforo-danificado", 
      "semaforo-amarelo-piscante", 
      "acidente-transito-comunicado"
    ], // Tipos permitidos para TrafficReport
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
const TrafficReport = mongoose.model('TrafficReport', trafficReportSchema);

module.exports = TrafficReport;
