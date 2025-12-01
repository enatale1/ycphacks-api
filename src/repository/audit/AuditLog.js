const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/index');

const AuditLog = sequelize.define(
    'AuditLog',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        tableName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
            allowNull: false
        },
        oldValue: {
            type: DataTypes.JSON,
            allowNull: true
        },
        newValue: {
            type: DataTypes.JSON,
            allowNull: true
        },
        userId: { // The id of the user who made the change
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },

    {
        tableName: 'AuditLog',
        timestamps: true,
        updatedAt: false, // we don't update audit rows
    }
);

module.exports = AuditLog;