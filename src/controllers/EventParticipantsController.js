const EventParticipantsRepo = require('../repository/team/EventParticipantRepo');
const TeamRepo = require('../repository/team/TeamRepo')
const EventRepo = require('../repository/event/EventRepo')

class EventParticipantController{
    static async getUnassignedParticipants(req, res) {
        try {
            const eventId = req.query.eventId || 1; 

            const participants = await EventParticipantsRepo.findUnassignedParticipants(eventId);

            const nonBannedParticipants = participants.filter(p =>
                p.participants && p.participants.isBanned !== true && p.participants.isBanned !== 1
            );

            const formattedParticipants = nonBannedParticipants.map(p => ({
                id: p.userId,
                firstName: p.participants?.firstName,
                lastName: p.participants?.lastName,
                email: p.participants?.email,
                checkIn: p.participants?.checkIn,
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
    static async getTeamsByEvent(req, res) {
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
                return res.status(500).json({ error: "Internal error: Failed to determine event ID." });
            }

            // 2. Call a new repository function to get teams filtered by event
            const teams = await TeamRepo.getTeamsByEvent(eventId); 

            // 3. Map the data for the response
            const teamData = teams.map(team => ({
                id: team.id,
                teamName: team.teamName,
                presentationLink: team.presentationLink || null,
                githubLink: team.githubLink || null, 
                projectName: team.projectName || null,
                projectDescription: team.projectDescription || null,
                
                // Map the team members list
                participants: team.EventParticipants ? 
                    team.EventParticipants.map(participant => {
                        const user = participant.participants; 
                        
                        // Safety check remains valid
                        if (!user) {
                            console.warn(`Participant record in team ${team.id} is missing User details.`);
                            return 'Unknown User'; 
                        }
                        
                        return {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName
                        };
                    })
                    : []
            }));

            res.status(200).json({ 
                message: `Successfully fetched teams for event ${eventId}`, 
                data: teamData 
            });

        } catch (err) {
            console.error('Error getting teams by event:', err);
            res.status(500).json({ message: 'Error getting teams by event', error: err.message });
        }
    }
}

module.exports = EventParticipantController;