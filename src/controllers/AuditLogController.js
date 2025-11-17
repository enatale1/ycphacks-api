const AuditLogRepo = require("../repository/audit/AuditLogRepo");

const getAllLogs = async (req, res) => {
    try {
        // Get filters sent by frontend
        let {
            tableName,
            userId,
            action,
            start,
            end,
            sort = 'DESC',
            limit,
            page
        } = req.body;

        // Put filters into single object and clean values
        const filters = { tableName, userId, action, start, end, sort };
        limit = Number(limit) || 100;
        page = Number(page) || 1;

        // Retrieve logs from DB based on filters
        const { count, logs } = await AuditLogRepo.getAllLogs(filters, limit, page);

        return res.status(200).json({
            message: 'Audit logs retrieved successfully',
            logs: logs,
            pagination: {
                page: page,
                limit: limit,
                totalCount: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
};

module.exports = { getAllLogs };
