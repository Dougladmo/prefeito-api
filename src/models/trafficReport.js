const mongoose = require('mongoose');

// Definindo o esquema de TrafficReport
const trafficReportSchema = new mongoose.Schema({
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
    enum: ["pendente", "em andamento", "resolvido"],
    default: "pendente" 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  image: { 
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }, 
});

// Criando o modelo
const TrafficReport = mongoose.model('TrafficReport', trafficReportSchema);

module.exports = TrafficReport;
