const EventParticipantsRepo = require('../repository/team/EventParticipantRepo');
const EventRepo = require('../repository/event/EventRepo')
const UserRepo = require('../repository/user/UserRepo')

class EventParticipantController{
    static async getUnassignedParticipants(req, res) {
        try {
            const eventId = req.query.eventId || 1; 

            const participants = await EventParticipantsRepo.findUnassignedParticipants(eventId);

            const nonBannedParticipants = participants.filter(p =>
                p.userDetails && p.userDetails.isBanned !== true && p.userDetails.isBanned !== 1
            );

            const formattedParticipants = nonBannedParticipants.map(p => ({
                id: p.userId,
                firstName: p.userDetails?.firstName,
                lastName: p.userDetails?.lastName,
                email: p.userDetails?.email,
                checkIn: p.userDetails?.checkIn,
                teamId: p.teamId
            }));

            res.status(200).json({ message: 'Successfully fetched unassigned participants', data: formattedParticipants });
        } catch (err) {
            console.error("Backend Error in getUnassignedParticipants:", err);
            res.status(500).json({ message: 'Error getting unassigned participants', error: err.message });
        }
    }
    static async assignParticipant(req, res) {
        const { userId, eventId, teamId } = req.body;

        if (!userId || !eventId || !teamId) {
            return res.status(400).json({ message: 'Missing userId, eventId, or teamId in request body.' });
        }

        try {
            const success = await EventParticipantsRepo.assignToTeam(userId, eventId, teamId);

            if (success) {
                return res.status(200).json({ message: `User ${userId} successfully assigned to Team ${teamId}.` });
            } else {
                return res.status(404).json({ message: `Event participant record for user ${userId} not found or update failed.` });
            }
        } catch (error) {
            console.error("Error assigning participant to team:", error);
            res.status(500).json({ 
                message: 'Failed to assign participant to team.', 
                error: error.message 
            });
        }
    }
    static async unassignParticipant(req, res){
        const {userId, eventId} = req.body;

        if(!userId || !eventId){
            return res.status(400).json({ message: 'Missing userId or eventId in request body.' });
        }

        try {
            const success = await EventParticipantsRepo.assignToTeam(userId, eventId, null);

            if (success) {
                return res.status(200).json({ message: `User ${userId} successfully unassigned from team.` });
            } else {
                return res.status(404).json({ message: `Event participant record for user ${userId} not found or update failed.` });
            }
        } catch (error) {
            console.error("Error unassigning participant from team:", error);
            res.status(500).json({ 
                message: 'Failed to unassign participant.', 
                error: error.message 
            });
        }
    }
    static async getUserTeamStatus(req, res){
        const userId = req.params.userId;
        const eventId = req.query.eventId;

        if(!userId || !eventId){
            return res.status(400).json({ message: 'Missing user ID or event ID' });
        }

        try{
            const participant = await EventParticipantsRepo.findParticipantsByUserIdAndEventId(userId, eventId);

            const teamId = participant ? participant.teamId : null;

            return res.status(200).json({
                teamId: teamId,
                message: 'Successfully retrieved user team status'
            });
        }catch(err){
            console.error("Error fetching user team status:", err);
            return res.status(500).json({ message: 'Server error retrieving team status' });
        }
    }
    static async addParticipantToEvent(req, res){
        const {userId, eventId} = req.body;

        if(!userId || !eventId){
            return res.status(400).json({ message: 'Missing userId or eventId in request body.' });
        }

        try {
            // The repository method should handle creating the new EventParticipant record.
            const newParticipant = await EventParticipantsRepo.addParticipant(userId, eventId);

            return res.status(201).json({ 
                message: `User ${userId} successfully added as participant to Event ${eventId}.`,
                data: newParticipant 
            });
        } catch (error) {
            console.error("Error adding participant to event:", error);
            // Check for specific error like duplicate entry if the repo provides it
            if (error.message.includes('duplicate')) { 
                return res.status(409).json({ message: 'Participant is already registered for this event.', error: error.message });
            }
            res.status(500).json({ 
                message: 'Failed to add participant to event.', 
                error: error.message 
            });
        }
    }
    static async getUsersByEvent(req, res){
        try {
            // 1. Get eventId from query parameters
            let { eventId } = req.query;
            if (eventId === 'undefined' || eventId === '') {

                const activeEvent = await EventRepo.findActiveEvent();

                if (!activeEvent) {
                    return res.status(404).json({ error: "No eventId provided and no active event found." });
                }
                eventId = activeEvent.id; 
            }

            if (!eventId) {
                return res.status(500).json({ error: "Internal error: Failed to determine active event ID." });
            }

            // 2. Call a new repository function to get users filtered by event
            const users = await EventParticipantsRepo.getUsersByEvent(eventId); 

            // 3. Map the data
            const userData = users.map(user => ({
                id: user.dataValues.id,
                firstName: user.dataValues.firstName,
                lastName: user.dataValues.lastName,
                age: user.dataValues.age,
                email: user.dataValues.email,
                phoneNumber: user.dataValues.phoneNumber,
                school: user.dataValues.school,
                tShirtSize: user.dataValues.tShirtSize,
                dietaryRestrictions: user.dataValues.dietaryRestrictions,
                role: user.dataValues.role,
                checkIn: user.dataValues.checkIn,
                isBanned: user.dataValues.isBanned
            }));

            res.status(200).json({ message: `Successfully fetched users for event ${eventId}`, data: userData });
        } catch (err) {
            res.status(500).json({ message: 'Error getting users by event', error: err.message });
        }
    }
    static async getStaffForEvent(req, res){
        // Assuming eventId is passed via URL params, e.g., /api/events/1/staff
        const eventId = req.params.eventId; 
        
        if (!eventId) {
            return res.status(400).json({ message: 'Missing event ID in request.' });
        }

        try {
            const staff = await UserRepo.getStaffForEvent(eventId);
            
            // Send the data back to the frontend
            res.status(200).json(staff);
        } catch (error) {
            console.error("Staff route error:", error); 
            res.status(500).json({ message: "Internal server error: Failed to fetch staff list." });
        }
    };
}

module.exports = EventParticipantController;