const { Op } = require('sequelize');
const AuditLog = require('./AuditLog');

const AuditLogRepo = {
    async getAllLogs(filters = {}, limit = 100, page = 1) {
        const where = {};

        if (filters.tableName) where.tableName = filters.tableName;
        if (filters.userId) where.userId = filters.userId;
        if (filters.action) where.action = filters.action;

        // Date range filtering
        if (filters.start || filters.end) {
            where.createdAt = {};
            if (filters.start) where.createdAt[Op.gte] = new Date(filters.start);
            if (filters.end) where.createdAt[Op.lte] = new Date(filters.end);
        }

        // Get offset using current page
        const offset = (page - 1) * limit;

        const result = await AuditLog.findAndCountAll({
            where,
            order: [['createdAt', filters.sort === 'ASC' ? 'ASC' : 'DESC']],
            limit: limit,
            offset: offset
        });

        return {
            count: result.count,
            logs: result.rows
        }
    },
};

module.exports = AuditLogRepo;
