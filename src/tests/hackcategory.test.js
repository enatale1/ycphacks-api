const request = require('supertest');
const app = require('../app');  // Import your Express app
const HackCategoryRepo = require('../repository/category/HackCategoryRepo');
const EventRepo = require('../repository/event/EventRepo');

// Mock the EventRepo to avoid actual database interaction
jest.mock('../repository/category/HackCategoryRepo');
jest.mock('../repository/event/EventRepo')

// Mock event so we have one in memory
const mockEvent = {
    id: 1,
    eventName: 'An event',
    startDate: '9999-01-01T12:00:00Z',
    endDate: '9999-01-03T12:00:00Z',
    canChange: false,
    year: 9999,
    isActive: false
}

const validHackCategoryCreateRequest = {
    eventId: 1,
    categoryName: 'Test Category',
};

const validHackCategoryCreateResponse = {
    id: 1,
    eventId: 1,
    categoryName: 'Test Category',
};

const getHackCategoriesByEventList = [
    {
        categoryName: 'First Category',
        eventId: 1
    },
    {
        categoryName: 'Test Category',
        eventId: 1
    }
];

const validGetHackCategoryByIdResponse = {
    id: 1,
    categoryName: "Cati-megati-gory",
    eventId: 1,
};

describe('POST /category/create', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('creates a new hack category and returns 201', async () => {
        EventRepo.findEventById.mockResolvedValue(mockEvent);
        HackCategoryRepo.createCategory.mockResolvedValue(validHackCategoryCreateResponse);

        // Act: send the HTTP request
        const res = await request(app)
            .post('/category/create/')
            .send({
                ...validHackCategoryCreateRequest
            });


        // Assert: response checks
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Category created successfully');
        expect(res.body).toHaveProperty('category', validHackCategoryCreateResponse);

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).toHaveBeenCalledTimes(1);
        expect(EventRepo.findEventById).toHaveBeenCalledWith(validHackCategoryCreateRequest.eventId);

        expect(HackCategoryRepo.createCategory).toHaveBeenCalledTimes(1);
        expect(HackCategoryRepo.createCategory).toHaveBeenCalledWith({
            id: null,
            ...validHackCategoryCreateRequest,
        });
    });
});

describe('GET /category/by-event/:eventId', () => {
    afterEach(() => {
        // Reset mock calls before each test
        jest.resetAllMocks();
    });

    it('gets the categories for a given mock event (returns 201)', async () => {
        EventRepo.findEventById.mockResolvedValue(mockEvent);

        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/by-event/1');

        // Assert: response checks
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Categories for event retrieved successfully');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).toHaveBeenCalledTimes(1);
        expect(HackCategoryRepo.getCategoriesByEventId).toHaveBeenCalledWith(1);// this param is the event id

        expect(HackCategoryRepo.getCategoriesByEventId).toHaveBeenCalledTimes(1);
        expect(HackCategoryRepo.getCategoriesByEventId).toHaveBeenCalledWith(1);// this param is the event id
    });

    it('returns 400 (non-number eventID)', async () => {

        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/by-event/not_a_number');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('EventId provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });

    it('returns 400 (non-integer eventID)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/by-event/3.14');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('EventId provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });

    it('returns 400 (non-number eventID)', async () => {

        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/by-event/not_a_number');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('EventId provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });
});

describe('GET /category/:eventId', () => {
    afterEach(() => {
        // Reset mock calls before each test
        jest.restoreAllMocks();
    });

    it('gets the categories for a given event (returns 201)', async () => {
        HackCategoryRepo.getCategoryById.mockResolvedValue(validGetHackCategoryByIdResponse);

        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/1');

        // Assert: response checks
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Category with id retrieved successfully');
        expect(res.body).toHaveProperty('category', validGetHackCategoryByIdResponse);

        // Assert: verify mocks were called correctly
        expect(HackCategoryRepo.getCategoryById).toHaveBeenCalledTimes(1);
        expect(HackCategoryRepo.getCategoryById).toHaveBeenCalledWith(1);// this param is the event id
    });

    it('returns 400 (non-number eventID)', async () => {

        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/not_a_number');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('Id provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });

    it('returns 400 (non-integer eventID)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/3.14');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('Id provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });

    it('returns 400 (non-positive integer eventID)', async () => {
        // Act: send the HTTP request
        const res = await request(app)
            .get('/category/-10');

        // Assert: response checks
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Validation errors occurred');
        expect(res.body.errors.eventId).toEqual('Id provided is not a valid, positive integer');

        // Assert: verify mocks were called correctly
        expect(EventRepo.findEventById).not.toHaveBeenCalled();
        expect(HackCategoryRepo.getCategoriesByEventId).not.toHaveBeenCalled();
    });
});

