const request = require('supertest');
const app = require('../app');  // Import your Express app
const TeamRepo = require('../repository/team/TeamRepo'); // Mock User repository
const EventParticipantsRepo = require('../repository/team/EventParticipantRepo');
const EventRepo = require('../repository/event/EventRepo'); 
const TeamController= require('../controllers/TeamController');
const EventParticipantController= require('../controllers/EventParticipantsController');
const Team = require('../models/Team');

const MOCK_ADMIN_TOKEN = 'mock-admin-token';
const MOCK_TEAM_ID = 1;
const MOCK_EVENT_ID = 1;
const MOCK_USER_ID_1 = 101;
const MOCK_USER_ID_2 = 102;

// FIX: Convert MOCK_TEAM_ID to string for assertions where the controller is passing a string
const MOCK_TEAM_ID_STR = MOCK_TEAM_ID.toString();

const mockTeamData = {
    id: MOCK_TEAM_ID,
    teamName: 'Team Alpha',
    projectName: 'The Best Project',
    projectDescription: 'A hack for the ages.',
    presentationLink: 'https://slides.com/alpha',
    githubLink: 'https://github.com/alpha/repo',
    eventId: MOCK_EVENT_ID,
};

const mockParticipant1 = { id: MOCK_USER_ID_1, firstName: 'User', lastName: 'One' };
const mockParticipant2 = { id: MOCK_USER_ID_2, firstName: 'User', lastName: 'Two' };

const mockEventParticipantsData = [
    {
        userId: MOCK_USER_ID_1,
        teamId: MOCK_TEAM_ID,
        participants: mockParticipant1,
    },
    {
        userId: MOCK_USER_ID_2,
        teamId: MOCK_TEAM_ID,
        participants: mockParticipant2,
    },
];

const mockEventParticipantsFormatted = [
    { id: MOCK_USER_ID_1, name: 'User One' },
    { id: MOCK_USER_ID_2, name: 'User Two' },
];

const createSequelizeMock = (data) => ({
    ...data,
    dataValues: data,
    toJSON: function() { return this.dataValues || this; }
});

// Mock the Repositories
jest.mock('../repository/team/TeamRepo');
jest.mock('../repository/team/EventParticipantRepo');
jest.mock('../repository/event/EventRepo');

// Mock TeamDto to ensure it returns the correct property mapping,
jest.mock('../dto/TeamDto', () => {
    return jest.fn().mockImplementation(function(eventId, teamName, presentationLink, githubLink, projectName, projectDescription) {
        return {
            eventId: eventId,
            teamName: teamName, 
            presentationLink: presentationLink,
            githubLink: githubLink,
            projectName: projectName,
            projectDescription: projectDescription
        };
    });
});

// Mock Team model validation
// This block is correctly placed before the jest.mock call below it, solving the ReferenceError.
jest.mock('../models/Team', () => {
    // Define the mock constructor function here
    const MockTeamModel = jest.fn().mockImplementation(function(eventId, teamName) {
        this.eventId = eventId;
        this.teamName = teamName;
        this.validate = jest.fn().mockReturnValue({}); // Default to valid
    });
    return MockTeamModel;
});


describe('TeamController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the default mock validation for the Team model for each test
        Team.mockImplementation(function(eventId, teamName) {
            this.eventId = eventId;
            this.teamName = teamName;
            this.validate = jest.fn().mockReturnValue({});
        });
    });

    // --------------------------------------------------------------------------
    // 1. POST /teams/create (createTeam)
    // --------------------------------------------------------------------------
    describe('POST /teams/create', () => {
        const createTeamPayload = {
            ...mockTeamData,
            participantIds: [MOCK_USER_ID_1, MOCK_USER_ID_2],
        };

        it('should create a team, assign participants, and return 201', async () => {
            // Arrange
            TeamRepo.create.mockResolvedValue(createSequelizeMock(mockTeamData));
            EventParticipantsRepo.assignToTeam.mockResolvedValue(true);
            
            // Act
            const res = await request(app)
                .post('/teams/create')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(createTeamPayload);

            // Assert
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Create Team successful:');
            expect(res.body.data.teamName).toEqual(mockTeamData.teamName); 
            expect(TeamRepo.create).toHaveBeenCalledTimes(1);
            
            // Ensure participants were assigned
            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledTimes(2);
            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledWith(
                MOCK_USER_ID_1,
                MOCK_EVENT_ID,
                MOCK_TEAM_ID
            );
        });

        it('should return 400 for validation errors', async () => {
            // Arrange: Mock validation to fail
            Team.mockImplementation(function() {
                this.validate = jest.fn().mockReturnValue({ teamName: 'Name required' });
            });

            // Act
            const res = await request(app)
                .post('/teams/create')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send({}); // Send invalid payload

            // Assert
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Validation errors occurred when creating teams');
            expect(res.body.errors).toHaveProperty('teamName');
            expect(TeamRepo.create).not.toHaveBeenCalled();
        });

        it('should return 500 if database creation fails', async () => {
            // Arrange
            // The beforeEach block and this explicit mock setup correctly ensure the DB failure path is tested.
            TeamRepo.create.mockRejectedValue(new Error('DB Error'));
            
            // Act
            const res = await request(app)
                .post('/teams/create')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(createTeamPayload); // Use valid payload here

            // Assert
            expect(res.statusCode).toEqual(500); 
            expect(res.body.message).toContain('Error persisting team in database');
        });
    });

    // --------------------------------------------------------------------------
    // 2. GET /teams/all (getAllTeams)
    // --------------------------------------------------------------------------
    describe('GET /teams/all', () => {
        const teamWithParticipants = {
            ...mockTeamData,
            participants: mockEventParticipantsFormatted,
        };

        it('should fetch all teams with their participants and return 200', async () => {
            // Arrange
            TeamRepo.getAllTeams.mockResolvedValue([createSequelizeMock(mockTeamData)]);
            EventParticipantsRepo.findParticipantsByTeamId.mockResolvedValue(mockEventParticipantsData);

            // Act
            const res = await request(app)
                .get('/teams/all')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`);

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Successfully fetched all teams');
            expect(res.body.data).toEqual([teamWithParticipants]);
            expect(TeamRepo.getAllTeams).toHaveBeenCalledTimes(1);
            expect(EventParticipantsRepo.findParticipantsByTeamId).toHaveBeenCalledWith(MOCK_TEAM_ID);
        });

        it('should return 500 if repository call fails', async () => {
            TeamRepo.getAllTeams.mockRejectedValue(new Error('Repo failure')); 

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const res = await request(app).get('/teams/all');

            expect(res.statusCode).toEqual(500);
            
            expect(res.body.message).toContain('Error getting all teams'); 
            expect(res.body.error).toContain('Repo failure');
            consoleErrorSpy.mockRestore();
        });
    });

    // --------------------------------------------------------------------------
    // 3. PUT /teams/:id (updateTeam)
    // --------------------------------------------------------------------------
    describe('PUT /teams/:id', () => {
        const updatePayload = {
            teamName: 'Updated Team Name',
            projectName: 'New Project',
            participantIds: [MOCK_USER_ID_1], // Only one participant now
        };

        it('should update team details and synchronize participants, return 200', async () => {
            // Arrange
            const updatedTeamMock = { ...mockTeamData, ...updatePayload };
            TeamRepo.update.mockResolvedValue(updatedTeamMock);
            EventParticipantsRepo.synchronizeTeamMembers.mockResolvedValue(true);

            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}`)
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(updatePayload);

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual("Team and participants updated successfully.");
            expect(res.body.data.teamName).toEqual('Updated Team Name');
            expect(TeamRepo.update).toHaveBeenCalledWith(
                MOCK_TEAM_ID_STR, 
                expect.objectContaining({ teamName: 'Updated Team Name', projectName: 'New Project' })
            );
            expect(EventParticipantsRepo.synchronizeTeamMembers).toHaveBeenCalledWith(
                MOCK_TEAM_ID_STR,
                updatePayload.participantIds
            );
        });

        it('should return 404 if team not found', async () => {
            // Arrange
            TeamRepo.update.mockResolvedValue(null);

            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}`)
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(updatePayload);

            // Assert
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual("Team not found.");
            expect(EventParticipantsRepo.synchronizeTeamMembers).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid input (missing participant list)', async () => {
            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}`)
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send({ teamName: 'Test' }); // participantIds missing

            // Assert
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain("Invalid input: Team ID, name, and minimum participants are required.");
            expect(TeamRepo.update).not.toHaveBeenCalled();
        });
    });

    // --------------------------------------------------------------------------
    // 4. DELETE /teams/:id (deleteTeam)
    // --------------------------------------------------------------------------
    describe('DELETE /teams/:id', () => {
        it('should delete the team, fetch updated lists, and return 200', async () => {
            // Arrange
            TeamRepo.delete.mockResolvedValue(1); // 1 row deleted
            TeamRepo.getAllTeams.mockResolvedValue([]); // Empty team list after delete
            EventParticipantsRepo.findParticipantsByTeamId.mockResolvedValue([]); // Unassigned list

            // Act
            const res = await request(app)
                .delete(`/teams/${MOCK_TEAM_ID}`)
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`);

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain(`Team ID ${MOCK_TEAM_ID} successfully deleted.`);
            expect(res.body.teams).toEqual([]);
            expect(TeamRepo.delete).toHaveBeenCalledWith(MOCK_TEAM_ID_STR); 
            expect(EventParticipantsRepo.findParticipantsByTeamId).toHaveBeenCalledWith(null);
        });

        it('should return 404 if team not found', async () => {
            // Arrange
            TeamRepo.delete.mockResolvedValue(0); // 0 rows deleted

            // Act
            const res = await request(app)
                .delete(`/teams/${MOCK_TEAM_ID}`)
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`);

            // Assert
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual("Team not found.");
        });
    });

    // --------------------------------------------------------------------------
    // 5. GET /teams/:teamId/project-details (getTeamProjectDetails)
    // --------------------------------------------------------------------------
    describe('GET /teams/:teamId/project-details', () => {
        it('should fetch project details and return 200', async () => {
            // Arrange
            TeamRepo.findProjectDetailsById.mockResolvedValue(mockTeamData);

            // Act
            const res = await request(app)
                .get(`/teams/${MOCK_TEAM_ID}/project-details`);
                // Assuming this route is publicly accessible or requires different auth

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Successfully fetched project details');
            expect(res.body.data.projectName).toEqual(mockTeamData.projectName);
            expect(TeamRepo.findProjectDetailsById).toHaveBeenCalledWith(MOCK_TEAM_ID_STR); 
        });

        it('should return 404 if team not found', async () => {
            // Arrange
            TeamRepo.findProjectDetailsById.mockResolvedValue(null);

            // Act
            const res = await request(app)
                .get(`/teams/${MOCK_TEAM_ID}/project-details`);

            // Assert
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Team not found.');
        });
    });

    // --------------------------------------------------------------------------
    // 6. PUT /teams/:teamId/project-details (updateTeamProjectDetails)
    // --------------------------------------------------------------------------
    describe('PUT /teams/:teamId/project-details', () => {
        const projectUpdatePayload = {
            projectName: 'Final Project Name',
            githubLink: 'https://new.github.com/repo',
        };
        const teamInstanceMock = { ...mockTeamData, eventId: MOCK_EVENT_ID };

        it('should update project details when submissions are open and return 200', async () => {
            // Arrange
            TeamRepo.findById.mockResolvedValue(teamInstanceMock);
            EventRepo.isSubmissionPeriodOpen.mockResolvedValue(true);
            TeamRepo.updateProjectDetails.mockResolvedValue({ ...teamInstanceMock, ...projectUpdatePayload });

            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}/project-details`)
                .send(projectUpdatePayload);

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Project details updated successfully.');
            expect(res.body.data.projectName).toEqual('Final Project Name');
            expect(TeamRepo.updateProjectDetails).toHaveBeenCalledWith(MOCK_TEAM_ID_STR, projectUpdatePayload);
        });

        it('should return 403 when submissions are closed', async () => {
            // Arrange
            TeamRepo.findById.mockResolvedValue(teamInstanceMock);
            EventRepo.isSubmissionPeriodOpen.mockResolvedValue(false); // Submissions closed

            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}/project-details`)
                .send(projectUpdatePayload);

            // Assert
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toEqual('Submissions are closed for this event.');
            expect(TeamRepo.updateProjectDetails).not.toHaveBeenCalled();
        });

        it('should return 404 if team is not found (pre-check)', async () => {
            // Arrange
            TeamRepo.findById.mockResolvedValue(null);

            // Act
            const res = await request(app)
                .put(`/teams/${MOCK_TEAM_ID}/project-details`)
                .send(projectUpdatePayload);

            // Assert
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Team not found.');
        });
    });
});

describe('EventParticipantController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --------------------------------------------------------------------------
    // 7. GET /teams/unassignedParticipants (getUnassignedParticipants)
    // --------------------------------------------------------------------------
    describe('GET /teams/unassignedParticipants', () => {
        const mockUnassigned = [
            { userId: 301, teamId: null, eventId: 1, participants: { id: 301, firstName: 'A', lastName: 'Unassigned', email: 'a@example.com', checkIn: true, isBanned: false } },
            { userId: 302, teamId: null, eventId: 1, participants: { id: 302, firstName: 'B', lastName: 'Unassigned', email: 'b@example.com', checkIn: false, isBanned: 0 } },
            { userId: 303, teamId: null, eventId: 1, participants: { id: 303, firstName: 'C', lastName: 'Banned', email: 'c@example.com', checkIn: true, isBanned: true } }, // Should be filtered out
        ];
        const expectedFormatted = [
            { id: 301, firstName: 'A', lastName: 'Unassigned', email: 'a@example.com', checkIn: true, teamId: null },
            { id: 302, firstName: 'B', lastName: 'Unassigned', email: 'b@example.com', checkIn: false, teamId: null },
        ];

        it('should fetch unassigned, non-banned participants and return 200', async () => {
            // Arrange
            EventParticipantsRepo.findUnassignedParticipants.mockResolvedValue(mockUnassigned);

            // Act
            const res = await request(app)
                .get('/teams/unassignedParticipants?eventId=1')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`);

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(expectedFormatted);
            expect(res.body.data.length).toBe(2);
            expect(EventParticipantsRepo.findUnassignedParticipants).toHaveBeenCalledWith('1');
        });

        it('should return 500 on repository error', async () => {
            // Arrange
            EventParticipantsRepo.findUnassignedParticipants.mockRejectedValue(new Error('DB Fail'));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act
            const res = await request(app)
                .get('/teams/unassignedParticipants?eventId=1')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`);

            // Assert
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toContain('Error getting unassigned participants');
            consoleErrorSpy.mockRestore();
        });
    });
    
    // --------------------------------------------------------------------------
    // 9. PUT /teams/unassign (unassignParticipant)----------------------------
    describe('PUT /teams/unassign', () => {
        const unassignPayload = { userId: MOCK_USER_ID_1, eventId: MOCK_EVENT_ID };

        it('should unassign a participant (set teamId to null) and return 200', async () => {
            // Arrange
            EventParticipantsRepo.assignToTeam.mockResolvedValue(true); // Update successful

            // Act
            const res = await request(app)
                .put('/teams/unassign')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(unassignPayload);

            // Assert
            // FIXED: Revert expected status to 200 (Success)
            expect(res.statusCode).toEqual(200); 
            // FIXED: Change message to reflect successful unassignment
            expect(res.body.message).toEqual("User 101 successfully unassigned from team.");
            // This assertion should now pass, as the request is hitting the correct controller
            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledWith(MOCK_USER_ID_1, MOCK_EVENT_ID, null);
        });

        it('should return 404 if participant record not found', async () => {
            // Arrange
            EventParticipantsRepo.assignToTeam.mockResolvedValue(false); // Update failed (Participant not found)

            // Act
            const res = await request(app)
                .put('/teams/unassign')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send(unassignPayload);

            // Assert
            // FIXED: Revert expected status to 404 (Not Found)
            expect(res.statusCode).toEqual(404); 
            expect(res.body.message).toContain("participant record for user");
            // Also ensure the repository function was called with the correct args
            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledWith(MOCK_USER_ID_1, MOCK_EVENT_ID, null);
        });

        it('should return 400 for missing body fields', async () => {
            // Act
            const res = await request(app)
                .put('/teams/unassign')
                .set('Authorization', `Bearer ${MOCK_ADMIN_TOKEN}`)
                .send({ userId: MOCK_USER_ID_1 }); // Missing eventId

            // Assert
            expect(res.statusCode).toEqual(400); 
            // FIXED: The message you received in the last test was the correct one from the unassign controller's validation logic.
            expect(res.body.message).toContain('Missing userId or eventId in request body.');
            expect(EventParticipantsRepo.assignToTeam).not.toHaveBeenCalled();
        });
    });
});