const { Op } = require('sequelize');
const AuditLog = require('./AuditLog');

const AuditLogRepo = {
    async getAllLogs(filters = {}) {
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

        return AuditLog.findAll({
            where,
            order: [['createdAt', filters.sort === 'ASC' ? 'ASC' : 'DESC']],
            limit: filters.limit || 100
        });
    },
};

module.exports = AuditLogRepo;
