const EventParticipantModel = require('../../models/EventParticipant');
const UserModel = require('../../models/User');
const {EventParticipant, User} = require('../config/Models');
const { Op } = require('sequelize');

class EventParticipantRepo {
    static async findParticipantsByTeamId(teamId){
        return EventParticipant.findAll({
            where: { teamId: teamId },
            include: [{ 
                model: User, 
                as: 'participants',
                attributes: ['id', 'firstName', 'lastName', 'isBanned'],
                where: {
                    isBanned: { [Op.not]: true }
                }
            }],
        });
    }
    static async findParticipantsByUserIdAndEventId(userId, eventId){
        const participant = await EventParticipant.findOne({
            attributes: ['teamId'], 
            where: { userId: userId, eventId: eventId },
            
            include: [{ 
                model: User, 
                as: 'participants',
                attributes: [],
                where: {
                    isBanned: { [Op.not]: true }
                }
            }],
        });

        return participant;
    }
    static async findUnassignedParticipants(eventId) {
        return EventParticipant.findAll({
            where: {
                eventId: eventId,
                teamId: {
                    [Op.is]: null
                }
            },
            include: [{ 
                model: User, 
                as: 'participants',
                attributes: ['id', 'firstName', 'lastName', 'email', 'checkIn', 'isBanned'] ,
                where: {
                    checkIn: 1,
                    isBanned: {[Op.not]: true}
                }
            }],
            raw: false
        });
    }
    static async assignToTeam(userId, eventId, teamId){
        const [rowsUpdated] = await EventParticipant.update(
            { teamId: teamId },
            { 
                where: { 
                    userId: userId, 
                    eventId: eventId 
                },
                individualHooks: true
            }
        );
        return rowsUpdated > 0;
    }
    async getTeams(){
        return await Team.findAll({
            attributes: ["id", "eventId", "teamName", "presentationLink", "githubLink", "projectName", "projectDescription"]
        });
    }
    static async synchronizeTeamMembers(teamId, desiredParticipantIds, eventId=1){
        const currentMembersRecords = await EventParticipant.findAll({
            attributes: ['userId'],
            where: { teamId: teamId, eventId: eventId },
            raw: true
        });

        const currentMemberIds = currentMembersRecords.map(r => r.userId);

        const membersToAssign = desiredParticipantIds.filter(id => !currentMemberIds.includes(id));

        if (membersToAssign.length > 0) {
            await EventParticipant.update(
                { teamId: teamId },
                {
                    where: {
                        userId: { [Op.in]: membersToAssign },
                        eventId: eventId,
                    },
                    individualHooks: true
                }
            );
        }

        const membersToUnassign = currentMemberIds.filter(id => !desiredParticipantIds.includes(id));

        if (membersToUnassign.length > 0) {
            await EventParticipant.update(
                { teamId: null },
                {
                    where: {
                        userId: { [Op.in]: membersToUnassign },
                        eventId: eventId,
                        teamId: teamId, 
                    },
                    individualHooks: true
                }
            );
        }

        return true;
    }
}

module.exports = EventParticipantRepo;