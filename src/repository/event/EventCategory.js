const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const EventCategory = sequelize.define(
    'HackCategory',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        categoryName: {
            type: DataTypes.STRING(100), // Matches varchar(100)
            allowNull: false,
            require: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            require: true
        },
    },
    {
        tableName: 'HackCategory',
        timestamps: false
    }
);

module.exports = EventCategory;