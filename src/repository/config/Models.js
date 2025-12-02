const { sequelize, DataTypes } = require('./index'); // Sequelize instance

// Import all models (factory-defined)
const User = require('../user/User');
const Event = require('../event/Event');
const EventParticipant = require('../event/EventParticipant');
const Sponsor = require('../sponsor/Sponsor');
const SponsorTier = require('../sponsor/SponsorTier');
const EventSponsor = require('../sponsor/EventSponsor');
const Hardware = require('../hardware/Hardware');
const HardwareImage = require('../hardware/HardwareImage');
const Team = require('../team/Team');
const HackCategory = require('../event/HackCategory');
const Prize = require('../event/Prize');
const Analytics = require('../analytics/Analytics');
const Image = require('../image/Image');
const Activity = require('../event/Activity');
const AuditLog = require('../audit/AuditLog');

/* EVENT ASSOCIATIONS */

// Event <---> EventParticipant
Event.hasMany(EventParticipant, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
EventParticipant.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

// Event <---> EventSponsor
Event.hasMany(EventSponsor, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
EventSponsor.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

// Event <---> Activity
Event.hasMany(Activity, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
Activity.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

// Event <---> Prize
Event.hasMany(Prize, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
Prize.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

// Event <---> Team
Event.hasMany(Team, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
Team.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

// Event <---> HackCategory
Event.hasMany(HackCategory, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});
HackCategory.belongsTo(Event, {
    foreignKey: 'eventId',
    onDelete: 'CASCADE',
});

Team.hasMany(EventParticipant, { foreignKey: 'teamId' });
EventParticipant.belongsTo(Team, { foreignKey: 'teamId' });

EventParticipant.belongsTo(User, { foreignKey: 'userId', as: 'userDetails' });
User.hasMany(EventParticipant, { foreignKey: 'userId', as:'participant' });

/* HARDWARE/IMAGE ASSOCIATIONS */
Hardware.hasMany(HardwareImage, {
    foreignKey: 'hardwareId',
    as: 'images'
});
HardwareImage.belongsTo(Hardware, { foreignKey: 'hardwareId' });
// Function to attach model hooks
function attachAuditHooks() {
    const { AuditLog } = sequelize.models; // Grab all the models
    if (!AuditLog) {
        console.warn("AuditLog model not yet initialized. Hooks not attached.");
        return;
    }

    const ignored = ['AuditLog', 'User', 'EventParticipant']; // We don't want to audit the audit table itself or include participant actions
    const cleanData = (obj) => { // Remove sensitive/unnecessary information like password
        if (!obj) return null;
        const data = obj.toJSON();
        delete data.password;
        return data;
    };

    for (const modelName of Object.keys(sequelize.models)) {
        if (ignored.includes(modelName)) continue;

        const model = sequelize.models[modelName];

        // after create
        model.addHook('afterCreate', async (instance, options) => {
            await AuditLog.create({
                tableName: modelName,
                recordId: instance.id,
                action: 'CREATE',
                newValue: cleanData(instance),
                userId: options.userId || null
            });
        });

        // before update
        model.addHook('beforeUpdate', async (instance, options) => {
            const previous = await model.findByPk(instance.id);
            await AuditLog.create({
                tableName: modelName,
                recordId: instance.id,
                action: 'UPDATE',
                oldValue: previous ? cleanData(previous) : null,
                newValue: cleanData(instance),
                userId: options.userId || null
            });
        });

        // before destroy
        model.addHook('beforeDestroy', async (instance, options) => {
            await AuditLog.create({
                tableName: modelName,
                recordId: instance.id,
                action: 'DELETE',
                oldValue: cleanData(instance),
                userId: options.userId || null
            });
        });
    }
}

// Export models
module.exports = {
    sequelize,
    attachAuditHooks,
    User,
    Team,
    Event,
    Activity,
    EventParticipant,
    HackCategory,
    Prize,
    Sponsor,
    SponsorTier,
    EventSponsor,
    Image,
    Analytics,
    Hardware,
    HardwareImage,
    AuditLog
};

