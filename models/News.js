const mongoose = require('mongoose');

// Definindo o esquema de News
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Criando o modelo
const News = mongoose.model('News', newsSchema);

module.exports = News;
