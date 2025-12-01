const { Team } = require('../config/Models');

const TeamRepo = {
    // Method to create a new Team
    async create(team){
        return Team.create(team);
    },
    // Method to find a team by name
    async findByName(teamName){
        return await Team.findOne({
            where: {teamName}
        });
    },
    async findById(teamId){
        return await Team.findByPk(teamId);
    },
    async getAllTeams(){
        return await Team.findAll();
    },
    async update(teamId, teamData){
        if(teamData.id){
            delete teamData.id;
        }

        const [rowsUpdated] = await Team.update(
            teamData,
            {
                where: {id: teamId},
                individualHooks: true
            }
        );
        return rowsUpdated;
    },
    async delete(teamId){
        return Team.destroy({where: {id: teamId}});
    },
    async findProjectDetailsById(teamId) {
        try {
            const team = await Team.findByPk(teamId, {
                attributes: [
                    'id',
                    'teamName',
                    'projectName',
                    'projectDescription',
                    'presentationLink',
                    'githubLink',
                ]
            });

            return team ? team.toJSON() : null;
        } catch (error) {
            console.error('Repo error finding project details:', error);
            throw error;
        }
    },
    async updateProjectDetails(teamId, data) {
        try {
            const [rowsAffected] = await Team.update(
                { ...data },
                {
                    where: { id: teamId },
                }
            );

            if (rowsAffected === 0) {
                return null; // Team not found
            }

            // Fetch and return the updated record
            return this.findProjectDetailsById(teamId); 
            
        } catch (error) {
            console.error('Repo error updating project details:', error);
            throw error;
        }
    }
}

module.exports = TeamRepo;