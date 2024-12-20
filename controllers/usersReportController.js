const { dynamoDB } = require("../config/db");

const TABLE_NAMES = {
    guardReports: 'guardReport',
    trafficReports: 'trafficReport',
    publicLightingReports: 'publicLightingReport',
};

exports.getAllReportsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const queryTable = async (tableName) => {
            const params = {
                TableName: tableName,
                IndexName: "userId-index",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                },
            };

            const result = await dynamoDB.query(params);
            return result.Items || [];
        };

        const guardReports = await queryTable(TABLE_NAMES.guardReports);
        const trafficReports = await queryTable(TABLE_NAMES.trafficReports);
        const publicLightingReports = await queryTable(TABLE_NAMES.publicLightingReports);

        const allReports = [
            ...guardReports,
            ...trafficReports,
            ...publicLightingReports,
        ];

        if (allReports.length === 0) {
            return res.status(404).json({ message: "Nenhum relatório encontrado para este usuário" });
        }

        res.status(200).json(allReports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
