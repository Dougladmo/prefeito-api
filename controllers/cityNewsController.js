const { dynamoDB } = require("../config/db");
const TABLE_NAME = "cityNews";

exports.getAllNews = async (req, res) => {
    try {
      const params = {
        TableName: TABLE_NAME,
      };
  
      const result = await dynamoDB.scan(params);
      res.status(200).json(result.Items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };