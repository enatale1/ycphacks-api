const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/index');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING(50), // Matches varchar(50)
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        lastName: {
            type: DataTypes.STRING(50), // Matches varchar(50)
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        email: {
            type: DataTypes.STRING(100), // Matches varchar(100)
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("participant", "staff", "oscar"),
            defaultValue: "participant"
        },
        phoneNumber: {
            type: DataTypes.STRING(20), // Matches varchar(20)
            allowNull: false,
            require: true,
            validate: {
                len: [1, 20]
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gender: {
            type: DataTypes.STRING(50), // Matches varchar(50)
            defaultValue: null
        },
        country: {
            type: DataTypes.STRING(50), // Matches varchar(50)
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        tShirtSize: {
            type: DataTypes.STRING(5), // Matches varchar(5)
            allowNull: false,
            validate: {
                len: [1, 5]
            }
        },
        dietaryRestrictions: {
            type: DataTypes.STRING(255), // Matches varchar(255)
            defaultValue: null
        },
        school: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [1, 255]
            }
        },
        major: {
            type: DataTypes.STRING(100),
            defaultValue: null
        },
        graduationYear: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        levelOfStudy: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        hackathonsAttended: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        pronouns: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        linkedInUrl: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        checkIn: {
            type: DataTypes.BOOLEAN, // Matches tinyint(1)
            allowNull: false,
            defaultValue: false
        },
        mlhCodeOfConduct: {
            type: DataTypes.BOOLEAN, // Matches tinyint(1)
            allowNull: false,
        },
        mlhPrivacyPolicy: {
            type: DataTypes.BOOLEAN, // Matches tinyint(1)
            allowNull: false,
        },
        mlhEmails: {
            type: DataTypes.BOOLEAN, // Matches tinyint(1)
            defaultValue: false
        },
        isVerified: {
            type: DataTypes.BOOLEAN, // Matches tinyint(1)
            defaultValue: false
        },
        isBanned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: 'User',
        timestamps: true
    }
);

module.exports = User;
