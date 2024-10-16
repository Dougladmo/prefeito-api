// controllers/reportController.js
const TrafficReport = require('../models/trafficReport');
const GuardReport = require('../models/guardReport');
const PublicLightingReport = require('../models/publicLightingReport');

exports.getReportsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const trafficReports = await TrafficReport.find({ userId });
    const guardReports = await GuardReport.find({ userId });
    const publicLightingReports = await PublicLightingReport.find({ userId });

    const allReports = {
      trafficReports,
      guardReports,
      publicLightingReports
    };

    res.status(200).json(allReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
