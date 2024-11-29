const mongoose = require('mongoose');

// Definindo o esquema de GuardReport
const guardReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
  },
  description: { 
    type: String, 
  },
  location: { 
    type: String, 
  },
  status: { 
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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  },
});

// Criando o modelo
const GuardReport = mongoose.model('GuardReport', guardReportSchema);

module.exports = GuardReport;
