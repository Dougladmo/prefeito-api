const { dynamoDB } = require("../config/db");
const TABLE_NAME = "cityNews";

exports.getAllNews = async (req, res) => {
  try {
    const { lastEvaluatedKey } = req.query;

    const params = {
      TableName: TABLE_NAME,
      Limit: 5,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    };

    const result = await dynamoDB.scan(params);
    res.status(200).json({
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// os items sao retornados de 5 em 5