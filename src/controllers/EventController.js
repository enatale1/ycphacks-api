const EventRepo = require('../repository/event/EventRepo')
const Event = require('../models/Event')
const EventResponseDto = require('../dto/EventResponseDto')
const Activity = require('../models/Activity');
const ActivityResponseDto = require('../dto/ActivityResponseDto');

const createEvent = async (req, res) => {
    try {
        const eventData = req.body

        const event = new Event(
            null,
            eventData.eventName,
            eventData.startDate,
            eventData.endDate,
            eventData.canChange,
            eventData.isActive
        )

        // validate data and throw error if not valid
        const validationErrors = event.validate(true)
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        if (event.isActive && (await EventRepo.findActiveEvent())) {
            return res.status(400).json({
                message: "This event can't be active because another event is set as active",
                errors: { isActive: 'Another event is already active' }
            });
        }

        // Convert to plain object for Sequelize
        const eventObj = {
            eventName: event.eventName,
            startDate: event.startDate,
            endDate: event.endDate,
            canChange: event.canChange,
            isActive: event.isActive
        }

        const createdEvent = await EventRepo.createEvent(eventObj)

        if (!createdEvent) {
            return res.status(400).json({
                message: 'There was an error creating the event'
            })
        }

        // Create event response DTO
        const eventResponseDto = new EventResponseDto(
            createdEvent.id,
            createdEvent.eventName,
            createdEvent.startDate,
            createdEvent.endDate,
            createdEvent.canChange,
            createdEvent.isActive
        )

        return res.status(201).json({
            message: 'Event created successfully',
            event: eventResponseDto
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
}

const getAllEvents = async (req, res) => {
    try {
        const events = await EventRepo.getAllEvents()
        return res.status(200).json({
            message: 'Events retrieved successfully',
            events: events
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
}

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await EventRepo.findEventById(id)
        if (!event) {
            return res.status(404).json({
                message: 'Event not found'
            });
        } else {
            return res.status(200).json({
                message: 'Event retrieved successfully',
                event: event
            });
        }
    } catch (e){
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
}

const getActiveEvent = async (req, res) => {
    try {
        const event = await EventRepo.findActiveEvent()

        if (!event) {
            return res.status(404).json({
                message: 'There is no active event'
            });
        } else {
            return res.status(200).json({
                message: 'Active event retrieved successfully',
                event: event
            });
        }
    } catch (e){
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
}

const editEvent = async (req, res) => {
    try {
        const eventData = req.body;

        // Check existence of edit
        const existingEvent = await EventRepo.findEventById(eventData.id);
        if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

        const event = new Event(
            eventData.id,
            eventData.eventName,
            eventData.startDate,
            eventData.endDate,
            eventData.canChange,
            eventData.isActive
        );

        // Validate data
        const validationErrors = event.validate(false);
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        if (event.isActive && !existingEvent.isActive && (await EventRepo.findActiveEvent())) {
            return res.status(400).json({
                message: "This event can't be active because another event is set as active",
                errors: { isActive: 'Another event is already active' }
            });
        }

        // Convert to plain object for Sequelize
        const eventObj = {
            id: event.id,
            eventName: event.eventName,
            startDate: event.startDate,
            endDate: event.endDate,
            canChange: event.canChange,
            isActive: event.isActive
        }

        const [rowsUpdated] = await EventRepo.updateEvent(eventObj)

        if (rowsUpdated <= 0) {
            return res.status(404).json({
                message: "Event could not be updated"
            });
        }

        const updatedEvent = await EventRepo.findEventById(eventObj.id);

        // Create event response DTO
        const eventResponseDto = new EventResponseDto(
            updatedEvent.id,
            updatedEvent.eventName,
            updatedEvent.startDate,
            updatedEvent.endDate,
            updatedEvent.canChange,
            updatedEvent.isActive
        )

        return res.status(200).json({
            message: 'Event updated successfully',
            activity: eventResponseDto
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error updating event',
            error: e.message || e
        });
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check that the event id was provided
        if (!id) {
            return res.status(400).json({
                message: 'Event ID is required'
            });
        }

        // Check if the event exists
        const existingEvent = await EventRepo.findEventById(id);
        if (!existingEvent) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        // Delete event
        const rowsDeleted = await EventRepo.deleteEvent(id);

        // Check to make sure the event was deleted
        if (rowsDeleted <= 0) {
            return res.status(404).json({
                message: 'Event could not be deleted (not found or already removed)'
            });
        }

        return res.status(200).json({
            message: 'Event deleted successfully',
            deletedId: id
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error deleting event',
            error: e.message || e
        });
    }
}

const createActivity = async (req, res) => {
    try {
        const activityData = req.body;
        const activity = new Activity(
            null,
            activityData.activityName,
            activityData.activityDate,
            activityData.activityDescription,
            activityData.eventId
        );

        // Validate data
        const validationErrors = activity.validate(true);
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        // Convert to plain object for Sequelize
        const activityObj = {
            activityName: activity.activityName,
            activityDate: activity.activityDate,
            activityDescription: activity.activityDescription,
            eventId: activity.eventId
        }

        const createdActivity = await EventRepo.createActivity(activityObj)

        if (!createdActivity) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        // Create activity response DTO
        const activityResponseDto = new ActivityResponseDto(
          createdActivity.id,
          createdActivity.activityName,
          createdActivity.activityDate,
          createdActivity.activityDescription,
          createdActivity.eventId
        );

        return res.status(201).json({
            message: 'Activity created successfully',
            activity: activityResponseDto
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error creating activity',
            error: e.message || e
        });
    }
}

const getActivitiesForEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch activities and convert dates from DB to user-friendly dates (i.e., 12-hour format
        const activities = (await EventRepo.getAllActivities(id)).map(activity => {
            activity.activityDate = activity.activityDate.toISOString();
            return activity;
        })

        return res.status(200).json({
            message: 'Activities retrieved successfully',
            activities: activities
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message || e
        });
    }
}

const editActivity = async (req, res) => {
    try {
        const activityData = req.body;

        // Check existence of activity
        const existingActivity = await EventRepo.findActivityById(activityData.id);
        if (!existingActivity) return res.status(404).json({ message: 'Activity not found' });

        const activity = new Activity(
            activityData.id,
            activityData.activityName,
            activityData.activityDate,
            activityData.activityDescription,
            activityData.eventId
        );

        // Validate data
        const validationErrors = activity.validate(false);
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        // Convert to plain object for Sequelize
        const activityObj = {
            id: activity.id,
            activityName: activity.activityName,
            activityDate: activity.activityDate,
            activityDescription: activity.activityDescription,
            eventId: activity.eventId
        }

        const [rowsUpdated] = await EventRepo.updateActivity(activityObj)

        if (rowsUpdated <= 0) {
            return res.status(404).json({
                message: "Activity could not be updated (event not found)"
            });
        }

        const updatedActivity = await EventRepo.findActivityById(activityObj.id);

        // Create activity response DTO
        const activityResponseDto = new ActivityResponseDto(
            updatedActivity.id,
            updatedActivity.activityName,
            updatedActivity.activityDate.toISOString(),
            updatedActivity.activityDescription,
            updatedActivity.eventId
        );

        return res.status(200).json({
            message: 'Activity updated successfully',
            activity: activityResponseDto
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error updating activity',
            error: e.message || e
        });
    }
}

const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;

        // Check that the activity id was provided
        if (!id) {
            return res.status(400).json({
                message: 'Activity ID is required'
            });
        }

        // Check if the activity exists
        const existingActivity = await EventRepo.findActivityById(id);
        if (!existingActivity) {
            return res.status(404).json({
                message: 'Activity not found'
            });
        }

        // Delete activity
        const rowsDeleted = await EventRepo.deleteActivity(id);

        // Check to make sure the activity was deleted
        if (rowsDeleted <= 0) {
            return res.status(404).json({
                message: 'Activity could not be deleted (not found or already removed)'
            });
        }

        return res.status(200).json({
            message: 'Activity deleted successfully',
            deletedId: id
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error deleting activity',
            error: e.message || e
        });
    }
}

const createCategory = async (req, res) => {
    try {

        const category = {
            categoryName: req.body.categoryName,
            eventId: req.body.eventId
        }

        const createdCategory = await EventRepo.createCategory(category)

        if (!createdCategory) {
            return res.status(404).json({
                message: 'Event not found'
            });
        } else {
            return res.status(201).json({
                message: 'Category created successfully',
                activity: createdCategory
            });
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: e
        });
    }
}
const getCategoriesForEvent = async (req, res) => {

    const { id } = req.params;

    try {
        const categories = await EventRepo.getAllCategories(id)
        return res.status(200).json({
            message: 'categories retrieved successfully',
            categories: categories
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const editCategory = async (req, res) => {
    try {
        const category = {
            id: req.body.id,
            categoryName: req.body.categoryName,
            eventId: req.body.eventId
        }

        const updatedCategory = await EventRepo.updateCategory(category)
        return res.status(200).json({
            message: 'categories updated successfully',
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const updateEvent = async (req, res) => {
    try {
        const event = {
            id: req.body.id,
            eventName: req.body.eventName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            canChange: req.body.canChange
        }

        const updatedEvent = await EventRepo.updateEvent(event)
        return res.status(200).json({
            message: 'Event updated successfully',
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getActiveEvent,
    editEvent,
    deleteEvent,
    createActivity,
    getActivitiesForEvent,
    createCategory,
    getCategoriesForEvent,
    editCategory,
    editActivity,
    updateEvent,
    deleteActivity
}