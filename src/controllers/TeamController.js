const TeamModel = require('../repository/team/Team')
const TeamRepo = require('../repository/team/TeamRepo')
const Team = require('../models/Team')
const TeamDto = require('../dto/TeamDto')
const EventParticipantsRepo = require('../repository/team/EventParticipantRepo')
const EventRepo = require('../repository/event/EventRepo');

class TeamController {
    static async createTeam(req, res) {
        const { participantIds, ...teamData } = req.body;

        try{
            const team = new Team(
                teamData.eventId,
                teamData.teamName,
                teamData.presentationLink,
                teamData.githubLink,
                teamData.projectName,
                teamData.projectDescription
            )

            const validationErrors = team.validate()
            if(Object.keys(validationErrors).length > 0){
                return res.status(400).json({
                    message: 'Validation errors occurred when creating teams',
                    errors: validationErrors
                });
            }

            const teamObj = {
                teamName: team.teamName,
                projectName: team.projectName,
                projectDescription: team.projectDescription,
                presentationLink: team.presentationLink,
                githubLink: team.githubLink,
                eventId: team.eventId
            };

            const persistedTeam = await TeamRepo.create(teamObj);

            const teamDataValues = persistedTeam.dataValues || persistedTeam;
            const newTeamId = teamDataValues.id;

            if(participantIds && participantIds.length > 0 && newTeamId){
                const assignmentPromises = participantIds.map(userId =>
                    EventParticipantsRepo.assignToTeam(
                        userId,
                        team.eventId,
                        newTeamId
                    )
                );
                // Executes all assignment updates concurrently
                await Promise.all(assignmentPromises);
            }

            const responseDto = new TeamDto(
                teamDataValues.eventId,
                teamDataValues.teamName,
                teamDataValues.presentationLink,
                teamDataValues.githubLink,
                teamDataValues.projectName,
                teamDataValues.projectDescription
            );

            res.status(201).json({ message: 'Create Team successful:', data: responseDto });
        }catch(err){
            res.status(500).json({ message: 'Error persisting team in database:', error: err.message || JSON.stringify(err) });
        }
    }

    static async getAllTeams(req, res) {
        try{
            const teams = await TeamRepo.getAllTeams();
            const teamDataPromises = teams.map(async (team) => {
                const teamId = team.dataValues.id;

                const participants = await EventParticipantsRepo.findParticipantsByTeamId(teamId);

                const formattedParticipants = participants.map(p => ({
                    id: p.participants.id,
                    name: `${p.participants.firstName} ${p.participants.lastName}`
                }));
                
                return {
                    id: teamId,
                    teamName: team.dataValues.teamName,
                    projectName: team.dataValues.projectName,
                    projectDescription: team.dataValues.projectDescription,
                    presentationLink: team.dataValues.presentationLink,
                    githubLink: team.dataValues.githubLink,
                    eventId: team.dataValues.eventId,
                    participants: formattedParticipants
                };
            });
            
            const teamData = await Promise.all(teamDataPromises);

            res.status(200).json({ message: 'Successfully fetched all teams', data: teamData });
        }catch(err){
            console.error("Backend Error in getAllTeams:", err);
            res.status(500).json({ message: 'Error getting all teams', error:err.message });
        }
    }

    static async updateTeam(req, res){
        const teamId = req.params.id;

        const {
            teamName,
            projectName,
            projectDescription,
            presentationLink,
            githubLink,
            participantIds
        } = req.body;

        if(!teamId || !teamName || !Array.isArray(participantIds) || participantIds.length < 1){
            return res.status(400).json({ message: "Invalid input: Team ID, name, and minimum participants are required." });
        }

        try{
            const teamData = {
                teamName, 
                projectName, 
                projectDescription, 
                presentationLink, 
                githubLink
            };

            const updatedTeam = await TeamRepo.update(teamId, teamData);

            if (!updatedTeam) {
                return res.status(404).json({ message: "Team not found." });
            }
            
            await EventParticipantsRepo.synchronizeTeamMembers(teamId, participantIds);
        
            return res.status(200).json({ 
                message: "Team and participants updated successfully.", 
                data: updatedTeam 
            });

        } catch (error) {
            console.error("Error updating team:", error);
            return res.status(500).json({ message: "Failed to update team due to a server error." });
        }
    }
    static async deleteTeam(req, res) {
        const teamId = req.params.id;

        try {
            const success = await TeamRepo.delete(teamId); 

            if (success === 0) {
                return res.status(404).json({ message: "Team not found." });
            }
            
            const updatedTeamList = await TeamRepo.getAllTeams();
            const updatedUnassignedList = await EventParticipantsRepo.findParticipantsByTeamId(null);

            // Success response
            return res.status(200).json({ 
                message: `Team ID ${teamId} successfully deleted. All participants are now unassigned.`,
                teams: updatedTeamList, 
                unassignedUsers: updatedUnassignedList 
            });
        } catch (error) {
            console.error("Error deleting team:", error);
            return res.status(500).json({ message: "Failed to delete team due to a server error." });
        }
    }
    static async getTeamProjectDetails(req, res){
        const teamId = req.params.teamId;

        if(!teamId){
            return res.status(400).json({ message: 'Tean ID is required' });
        }

        try{
            const teamDetails = await TeamRepo.findProjectDetailsById(teamId);

            if(!teamDetails){
                return res.status(404).json({ message: 'Team not found.' });
            }

            return res.status(200).json({
                message: 'Successfully fetched project details',
                data: teamDetails
            });
        }catch(err){
            console.error('Error fetching team project details: ', err);
            return res.status(500).json({ message: 'Failed to fetch project details due to a server error.' });
        }
    }
    static async updateTeamProjectDetails(req, res){
        const teamId = req.params.teamId;
        const {
            projectName,
            projectDescription,
            presentationLink,
            githubLink
        } = req.body;

        if(!teamId){
            return res.status(400).json({ message: 'Team ID is required.' });
        }

        try{
            const team = await TeamRepo.findById(teamId);
            if(!team){
                return res.status(404).json({ message: 'Team not found.' });
            }
            
            // Assuming EventRepo has a function to check submission status
            const isSubmissionsOpen = await EventRepo.isSubmissionPeriodOpen(team.eventId); 
            if (!isSubmissionsOpen) {
                 return res.status(403).json({ message: 'Submissions are closed for this event.' });
            }

            // 3. Prepare data for update (only the project fields)
            const updateData = {
                projectName,
                projectDescription,
                presentationLink,
                githubLink
            };

            // Call the new repository function
            const updatedTeam = await TeamRepo.updateProjectDetails(teamId, updateData);

            if (!updatedTeam) {
                // This typically means the teamId was not found
                return res.status(404).json({ message: 'Team not found or update failed.' });
            }

            return res.status(200).json({ 
                message: 'Project details updated successfully.', 
                data: updatedTeam 
            });

        } catch (err) {
            console.error('Error updating team project details:', err);
            return res.status(500).json({ message: 'Failed to update project details due to a server error.' });
        }
    }
}

module.exports = TeamController;