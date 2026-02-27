const { DataTypes } = require('sequelize');
const {sequelize} = require('../config');

const Prize = sequelize.define(
    'Prize',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Event',
                key: 'id'
            },
            onDelete: 'CASCADE', // if event is deleted, the prize tied to that event will be deleted
            onUpdate: 'CASCADE'
        },
        prizeName: {
            type: DataTypes.STRING(100), // Matches varchar(100)
            allowNull: false,
            require: true
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'HackCategory',
                key: 'id'
            }
        },
        placement: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        handedOut: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    },

    {
        tableName: 'Prize'
    }
);

module.exports = Prize