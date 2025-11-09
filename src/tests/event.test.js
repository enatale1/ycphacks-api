const request = require('supertest');
const app = require('../app');  // Import your Express app
const EventRepo = require('../repository/event/EventRepo');

// Mock the EventRepo to avoid actual database interaction
jest.mock('../repository/event/EventRepo');

const validEventCreateRequest = {
    eventName: 'An event',
    startDate: '9999-01-01T12:00:00Z',
    endDate: '9999-01-03T12:00:00Z',
    canChange: false,
    isActive: false
};

describe('POST /create', () => {
    beforeEach(() => {
        // Reset mock calls before each test
        EventRepo.createEvent.mockReset();
        EventRepo.findEventById.mockReset();
        EventRepo.findActiveEvent.mockReset();
        jest.restoreAllMocks();
    });

    it('creates a new event and return 201', async () => {
        EventRepo.findEventById.mockResolvedValue(null); // no existing event
        EventRepo.findActiveEvent.mockResolvedValue(null); // no existing active event

        const mockEvent = {
            ...validEventCreateRequest,
            toJSON: function() { return this; } // Sequelize-like behavior
        };

        EventRepo.createEvent.mockResolvedValue(mockEvent);

        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Event created successfully');

        // Assert: verify mocks were called correctly
        expect(EventRepo.createEvent).toHaveBeenCalledTimes(1);
        expect(EventRepo.createEvent).toHaveBeenCalledWith(expect.objectContaining({
            ...validEventCreateRequest
        }));
    });

    it('returns 400 (no name)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                eventName: ''
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.eventName).toEqual('Name is required');
    });

    it('returns 400 (name too long)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                eventName: 'a'.repeat(101)
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.eventName).toEqual('Name cannot be more than 100 characters');
    });

    it('returns 400 (no start date)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                startDate: null
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.startDate).toEqual('Date is required');
    });

    it('returns 400 (invalid start date)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                startDate: '9999-01-01 01:00:00' // Incorrect format
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.startDate).toEqual('Invalid date format');
    });

    it('returns 400 (no end date)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                endDate: null
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.endDate).toEqual('Date is required');
    });

    it('returns 400 (invalid end date)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                endDate: '9999-01-01 01:00:00' // Incorrect format
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.endDate).toEqual('Invalid date format');
    });

    it('returns 400 (end date before start date)', async () => {
        let newDate = new Date(validEventCreateRequest.startDate)
        newDate = new Date(newDate.setDate(newDate.getDate() - 1));

        // Act: send the HTTP request
        const res = await request(app)
            .post('/event/create')
            .send({
                ...validEventCreateRequest,
                endDate: newDate.toISOString()
            });

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(Object.keys(res.body.errors).length).toEqual(1);  // There should be exactly one validation error
        expect(res.body.errors.endDate).toEqual('Date cannot be before the start date');
    });
});
