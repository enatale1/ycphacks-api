const AuditLogRepo = require("../repository/audit/AuditLogRepo");

const getAllLogs = async (req, res) => {
    try {
        // Get filters sent by frontend
        const {
            tableName,
            userId,
            action,
            start,
            end,
            sort = 'DESC',
            limit = 100
        } = req.body;

        // Put filters into single object
        const filters = {
            tableName,
            userId,
            action,
            start,
            end,
            sort,
            limit: parseInt(limit, 10)
        };

        // Retrieve logs from DB based on filters
        const logs = await AuditLogRepo.getAllLogs(filters);

        return res.status(200).json({
            message: 'Audit logs retrieved successfully',
            count: logs.length,
            logs: logs
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
};

module.exports = { getAllLogs };
