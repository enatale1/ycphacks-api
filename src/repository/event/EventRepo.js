const Event = require("./Event")
const HackCategories = require("./HackCategory")
const Activity = require("./Activity");


const EventRepo = {
    async createEvent(event) {
        return Event.create(event)
    },

    async updateEvent(event) {
        return Event.update({ ...event }, { where: { id: event.id } })
    },

    async findEventById(eventId) {
        return Event.findOne({ where: { id: eventId } })
    },

    async findActiveEvent() {
        return Event.findOne({ where: { isActive: true } })
    },

    async getAllEvents() {
        return Event.findAll()
    },

    async deleteEvent(eventId) {
        return Event.destroy({ where: { id: eventId } })
    },

    async createActivity(activity) {
        return Activity.create(activity);
    },

    async updateActivity(newActivity) {
        return Activity.update({ ...newActivity }, { where: { id: newActivity.id }});
    },

    async deleteActivity(activityId) {
      return Activity.destroy({ where: { id: activityId } })
    },

    async findActivityById(activityId) {
      return Activity.findOne({ where: { id: activityId } });
    },

    async getAllActivities(eventId) {
        return Activity.findAll({ where: { eventId: eventId } });
    },

    async createCategory( category) {
        const event = await Event.findOne({
            where: { id: category.eventId }
        })
        if (!event) {
            return null
        }
        return HackCategories.create({
            ...category
        })
    },
    async getAllCategories(id) {
        return HackCategories.findAll({
            where: { eventId: id }
        })
    },
    async updateCategory(category) {
        return HackCategories.update(
            {...category},
            {
                where: { id: category.id }
            }
        )
    },
    async updateEvent(event) {
        return Event.update(
            {...event},
            {
                where: { id: event.id }
            }
        )
    },
    async isSubmissionPeriodOpen(eventId) {
        try {
            const event = await Event.findByPk(eventId, {
                attributes: ['endDate']
            });

            if (!event || !event.endDate) {
                console.warn(`Event ID ${eventId} not found or missing end date.`);
                return false;
            }

            const endDate = new Date(event.endDate);
            const now = new Date();

            return now < endDate;

        } catch (error) {
            console.error(`Error checking submission period for event ${eventId}:`, error);
            return false; 
        }
    }
}

module.exports = EventRepo