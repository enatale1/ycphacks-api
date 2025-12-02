const EventParticipantController = require('../controllers/EventParticipantsController'); // <-- Potential fix: changed to singular
const EventParticipantsRepo = require('../repository/team/EventParticipantRepo');
const EventRepo = require('../repository/event/EventRepo');
const UserRepo = require('../repository/user/UserRepo');

// 1. Mock all external dependencies
jest.mock('../repository/team/EventParticipantRepo');
jest.mock('../repository/event/EventRepo');
jest.mock('../repository/user/UserRepo');

// --- Test Helpers ---

// Helper function to create a mock Express response object
const mockResponse = () => {
    const res = {};
    // Spy on status and json to capture their calls and allow chaining
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
};

// Helper function to create mock Sequelize-style participant data
const createMockParticipant = (userId, teamId, isBanned = false, checkIn = true) => ({
    userId: userId,
    teamId: teamId,
    userDetails: { 
        id: userId,
        firstName: `User${userId}`, 
        lastName: 'Test', 
        email: `user${userId}@test.com`,
        checkIn: checkIn,
        isBanned: isBanned,
    },
});

describe('EventParticipantController', () => {
    let req;
    let res;

    beforeEach(() => {
        // Clear all mock history before each test
        jest.clearAllMocks();
        res = mockResponse();
    });

    // ----------------------------------------------------
    // GET /unassignedParticipants
    // ----------------------------------------------------
    describe('getUnassignedParticipants', () => {
        const eventId = 1;

        it('should return 200 with formatted non-banned participants', async () => {
            req = { query: { eventId: eventId } };
            
            const mockData = [
                createMockParticipant(1, null),  // Unassigned, OK
                createMockParticipant(3, null, true), // Unassigned, Banned (Controller filters this)
                createMockParticipant(4, null, 1), // Unassigned, Banned (Controller filters this)
            ];

            EventParticipantsRepo.findUnassignedParticipants.mockResolvedValue(mockData);

            // Expect to see only User 1
            const expectedData = [{
                id: 1,
                firstName: 'User1',
                lastName: 'Test',
                email: 'user1@test.com',
                checkIn: true,
                teamId: null
            }];

            await EventParticipantController.getUnassignedParticipants(req, res);

            expect(EventParticipantsRepo.findUnassignedParticipants).toHaveBeenCalledWith(eventId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
                data: expectedData 
            }));
        });

        it('should default to eventId 1 if query param is missing', async () => {
            req = { query: {} }; // Missing eventId
            EventParticipantsRepo.findUnassignedParticipants.mockResolvedValue([]);

            await EventParticipantController.getUnassignedParticipants(req, res);

            expect(EventParticipantsRepo.findUnassignedParticipants).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 500 on repository error (and suppress console log)', async () => {
            req = { query: { eventId: eventId } };
            EventParticipantsRepo.findUnassignedParticipants.mockRejectedValue(new Error('DB Error'));

            // Spies on the actual console.error function and replaces it with an empty function
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); 

            await EventParticipantController.getUnassignedParticipants(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'DB Error' }));
            
            // Restores the original console.error function
            consoleErrorSpy.mockRestore(); 
        });
    });

    // ----------------------------------------------------
    // POST /assignParticipant
    // ----------------------------------------------------
    describe('assignParticipant', () => {
        const assignData = { userId: 5, eventId: 10, teamId: 20 };

        it('should successfully assign participant and return 200', async () => {
            req = { body: assignData };
            EventParticipantsRepo.assignToTeam.mockResolvedValue(true);

            await EventParticipantController.assignParticipant(req, res);

            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledWith(5, 10, 20);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User 5 successfully assigned to Team 20.' });
        });

        it('should return 400 if body data is missing', async () => {
            req = { body: { userId: 5, eventId: 10 } }; // Missing teamId
            
            await EventParticipantController.assignParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing userId, eventId, or teamId in request body.' });
            expect(EventParticipantsRepo.assignToTeam).not.toHaveBeenCalled();
        });

        it('should return 404 if participant record is not found for update', async () => {
            req = { body: assignData };
            EventParticipantsRepo.assignToTeam.mockResolvedValue(false); // Update failed or record not found

            await EventParticipantController.assignParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Event participant record for user 5 not found or update failed.' });
        });

        it('should return 500 on repository error (and suppress console log)', async () => {
            req = { body: assignData };
            EventParticipantsRepo.assignToTeam.mockRejectedValue(new Error('Assignment Error'));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); 

            await EventParticipantController.assignParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Assignment Error' }));
            
            consoleErrorSpy.mockRestore(); 
        });
    });

    // ----------------------------------------------------
    // PUT /unassignParticipant
    // ----------------------------------------------------
    describe('unassignParticipant', () => {
        const unassignData = { userId: 5, eventId: 10 };

        it('should successfully unassign participant (teamId: null) and return 200', async () => {
            req = { body: unassignData };
            EventParticipantsRepo.assignToTeam.mockResolvedValue(true);

            await EventParticipantController.unassignParticipant(req, res);

            // Crucial: check that the third argument is null
            expect(EventParticipantsRepo.assignToTeam).toHaveBeenCalledWith(5, 10, null); 
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User 5 successfully unassigned from team.' });
        });

        it('should return 400 if body data is missing', async () => {
            req = { body: { userId: 5 } }; // Missing eventId
            
            await EventParticipantController.unassignParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing userId or eventId in request body.' });
        });
    });

    // ----------------------------------------------------
    // GET /user/:userId/teamStatus
    // ----------------------------------------------------
    describe('getUserTeamStatus', () => {
        it('should return 200 with the teamId if participant is assigned', async () => {
            req = { params: { userId: 1 }, query: { eventId: 10 } };
            const mockParticipant = { teamId: 5 };
            EventParticipantsRepo.findParticipantsByUserIdAndEventId.mockResolvedValue(mockParticipant);

            await EventParticipantController.getUserTeamStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ teamId: 5, message: expect.anything() });
        });

        it('should return 200 with null teamId if participant is unassigned', async () => {
            req = { params: { userId: 1 }, query: { eventId: 10 } };
            const mockParticipant = { teamId: null };
            EventParticipantsRepo.findParticipantsByUserIdAndEventId.mockResolvedValue(mockParticipant);

            await EventParticipantController.getUserTeamStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ teamId: null, message: expect.anything() });
        });
    });

    // ----------------------------------------------------
    // GET /staff/:eventId
    // ----------------------------------------------------
    describe('getStaffForEvent', () => {
        const eventId = 10;
        
        it('should return 200 with the list of staff members', async () => {
            req = { params: { eventId: eventId } };
            const mockStaff = [{ firstName: 'Staff', lastName: 'A' }];
            UserRepo.getStaffForEvent.mockResolvedValue(mockStaff);

            await EventParticipantController.getStaffForEvent(req, res);

            expect(UserRepo.getStaffForEvent).toHaveBeenCalledWith(eventId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockStaff);
        });

        it('should return 400 if eventId is missing', async () => {
            req = { params: {} };

            await EventParticipantController.getStaffForEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(UserRepo.getStaffForEvent).not.toHaveBeenCalled();
        });
        
        it('should return 500 on repository error (and suppress console log)', async () => {
            req = { params: { eventId: eventId } };
            UserRepo.getStaffForEvent.mockRejectedValue(new Error('Staff DB Error'));
            
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); 

            await EventParticipantController.getStaffForEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining("Internal server error") });
            
            consoleErrorSpy.mockRestore(); 
        });
    });
});