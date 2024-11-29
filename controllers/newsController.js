const News = require('../models/News');

const newsController = {
  // Criar uma nova notícia
  async createNews(req, res) {
    try {
      const news = new News(req.body);
      await news.save();
      res.status(201).json({ msg: "Notícia criada com sucesso.", news });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao criar a notícia.", error });
    }
  },

  // Obter todas as notícias
  async getAllNews(req, res) {
    try {
      const news = await News.find();
      res.status(200).json(news);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao buscar notícias.", error });
    }
  },

  // Obter uma notícia pelo ID
  async getNewsById(req, res) {
    try {
      const news = await News.findById(req.params.id);
      if (!news) {
        return res.status(404).json({ msg: "Notícia não encontrada." });
      }
      res.status(200).json(news);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao buscar a notícia.", error });
    }
  },

  // Atualizar uma notícia pelo ID
  async updateNewsById(req, res) {
    try {
      const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!news) {
        return res.status(404).json({ msg: "Notícia não encontrada." });
      }
      res.status(200).json({ msg: "Notícia atualizada com sucesso.", news });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao atualizar a notícia.", error });
    }
  },

  // Deletar uma notícia pelo ID
  async deleteNewsById(req, res) {
    try {
      const news = await News.findByIdAndDelete(req.params.id);
      if (!news) {
        return res.status(404).json({ msg: "Notícia não encontrada." });
      }
      res.status(200).json({ msg: "Notícia deletada com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Erro ao deletar a notícia.", error });
    }
  },
};

module.exports = newsController;
