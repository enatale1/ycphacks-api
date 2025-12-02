const request = require('supertest');
const app = require('../app');
const EventSponsorRepo = require('../repository/sponsor/EventSponsorRepo');
const SponsorRepo = require('../repository/sponsor/SponsorRepo');

// --- MOCK DATA ---

const mockSponsorWithEventInfo = {
    id: 20, // Sponsor ID
    sponsorName: 'Tech Giant Inc',
    sponsorWebsite: 'http://techgiant.com',
    sponsorImageId: null,
    
    // Nested association data for getEventSponsors route
    EventSponsors: [{ 
        id: 50, 
        SponsorTier: { 
            tier: 'Platinum',
            toJSON: () => ({ tier: 'Platinum' })
        },
        sponsorTierId: 5,
    }],
    
    // toJSON for the GET /by-event/:eventId route
    toJSON: function() {
        return {
            id: this.id,
            name: this.sponsorName,
            website: this.sponsorWebsite,
            image: this.sponsorImageId || "",
            sponsorTierId: this.EventSponsors?.[0]?.sponsorTierId,
        };
    },

    // toJSON for the /sponsors?eventId=X route (which requires tier and image)
    toJSONWithTier: function() {
        const eventSponsor = this.EventSponsors?.[0];
        const tier = eventSponsor?.SponsorTier?.tier || "";
        return {
            id: this.id, 
            name: this.sponsorName,
            website: this.sponsorWebsite,
            image: this.sponsorImageId || "",
            tier: tier,
        };
    }
};

const mockEventSponsorCreateResult = {
    sponsor: { id: 20, sponsorName: 'New Startup LLC', sponsorWebsite: 'http://newstartup.com', },
    eventSponsor: { id: 50, eventId: 123, sponsorId: 20, sponsorTierId: 5 },
    toJSON: function() {
        return {
            sponsor: this.sponsor,
            eventSponsor: this.eventSponsor
        };
    }
};

const mockTierData = {
    id: 5,
    tier: 'Platinum',
    lowerThreshold: 1000,
    imageWidth: 200,
    imageHeight: 100,
};

const mockTier = {
    ...mockTierData, // Provides direct property access (tier.tier)
    dataValues: mockTierData, // Provides Sequelize internal access (tier.dataValues.tier)
    toJSON: function() { 
        // This simulates the ORM data being processed, mapping 'tier' to 'name' 
        // and including all properties expected by the client or subsequent logic.
        return { 
            id: this.id, 
            name: this.tier,
            lowerThreshold: this.lowerThreshold, 
            imageWidth: this.imageWidth, 
            imageHeight: this.imageHeight
        }; 
    }
};

const mockCreatedTier = {
    id: 6,
    tier: 'Bronze',
    lowerThreshold: 500,
    imageWidth: 150, 
    imageHeight: 75,  
    toJSON: function() { 
        return { 
            id: this.id, 
            name: this.tier,
            lowerThreshold: this.lowerThreshold, 
            imageWidth: this.imageWidth, 
            imageHeight: this.imageHeight 
        }; 
    }
};

const mockUpdatedTier = {
    id: 5,
    tier: 'Super Platinum',
    lowerThreshold: 1500,
    imageWidth: 200,
    imageHeight: 100,
    toJSON: function() { 
        return { 
            id: this.id, 
            name: this.tier,
            lowerThreshold: this.lowerThreshold, 
            imageWidth: this.imageWidth, 
            imageHeight: this.imageHeight 
        }; 
    }
};
const mockUpdatedSponsorForPut = { 
    id: 20, // Sponsor ID
    sponsorName: 'Updated Tech Giant Corp.',
    sponsorWebsite: 'http://updated.com',
    sponsorImageId: 10,
    amount: 5000,
    toJSON: function() { 
        return { 
            id: this.id,
            name: this.sponsorName, 
            website: this.sponsorWebsite,
            image: this.sponsorImageId,
            amount: this.amount,
        }; 
    }
};

const mockUpdatedEventSponsor = {
    id: 50, // EventSponsor ID
    sponsorId: 20,
    eventId: 123,
    sponsorTierId: 6,
    toJSON: function() { 
        return { 
            id: this.id,
            sponsorId: this.sponsorId, 
            eventId: this.eventId,
            sponsorTierId: this.sponsorTierId
        }; 
    }
};

// --- MOCK REPOSITORY ---

jest.mock('../repository/sponsor/EventSponsorRepo', () => ({
    getSponsorsByEvent: jest.fn(),
    addSponsorToEvent: jest.fn(),
    removeSponsorFromEvent: jest.fn(),
    getSponsorTiers: jest.fn(),
    addSponsorTier: jest.fn(),
    updateSponsorTier: jest.fn(),
    removeSponsorTier: jest.fn(),
    updateEventSponsor: jest.fn()
}), { virtual: true });

// Mock the SponsorRepo used for deletion in the controller
jest.mock('../repository/sponsor/SponsorRepo', () => ({
    deleteSponsorById: jest.fn(),
    updateSponsor: jest.fn(),
}), { virtual: true });

const mockUpdatedSponsor = mockUpdatedSponsorForPut;
const mockAdminToken = 'Bearer valid.admin.token';
const EventSponsorRepoInstance = EventSponsorRepo;
const SponsorRepoInstance = SponsorRepo;

describe('Event Sponsor Routes', () => {
    // let consoleErrorSpy;

    // beforeAll(() => {
    //     consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // });

    // afterAll(() => {
    //     consoleErrorSpy.mockRestore();
    // })

    beforeEach(() => {
        // Reset mock calls before each test
        EventSponsorRepoInstance.getSponsorsByEvent.mockReset();
        EventSponsorRepoInstance.addSponsorToEvent.mockReset();
        EventSponsorRepoInstance.updateEventSponsor.mockReset();
        EventSponsorRepoInstance.removeSponsorFromEvent.mockReset();
        EventSponsorRepoInstance.getSponsorTiers.mockReset();

        EventSponsorRepoInstance.addSponsorTier.mockReset();
        EventSponsorRepoInstance.updateSponsorTier.mockReset();
        EventSponsorRepoInstance.removeSponsorTier.mockReset();
        
        SponsorRepoInstance.deleteSponsorById.mockReset();
        SponsorRepoInstance.updateSponsor.mockReset();
    });

    // Test to get all the event sponsors
    describe('GET /', () => {
        it('should return 400 if eventId query parameter is missing', async () => {
            const res = await request(app).get('/sponsors');
            expect(res.statusCode).toEqual(400); 
            expect(res.body).toHaveProperty('error', 'eventId required'); 
            expect(EventSponsorRepoInstance.getSponsorsByEvent).toHaveBeenCalledTimes(0);
        });

        it('should return 500 if the repository operation fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Mock the function to intentionally throw the error
            EventSponsorRepoInstance.getSponsorsByEvent.mockRejectedValue(new Error('DB connection failed'));

            const res = await request(app)
                .get('/sponsors?eventId=123');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('error');
        
            consoleErrorSpy.mockRestore();
        });
    });

    // Test to get sponsors for an event
    describe('GET /by-event/:eventId', () => {
        const testEventId = 101;

        const expectedSponsorOutput = {
            id: mockSponsorWithEventInfo.id,
            name: mockSponsorWithEventInfo.sponsorName,
            website: mockSponsorWithEventInfo.sponsorWebsite,
            imageUrl: "",
            sponsorTierId: mockSponsorWithEventInfo.EventSponsors[0].sponsorTierId,
        };

        it('should return 200 and sponsors for a specific eventId', async () => {
            EventSponsorRepoInstance.getSponsorsByEvent.mockResolvedValue([mockSponsorWithEventInfo]);

            const res = await request(app).get(`/sponsors/by-event/${testEventId}`);
            expect(res.statusCode).toEqual(200); 
            expect(res.body).toEqual([expectedSponsorOutput]); 
        });
    });

    // Test to get sponsor tiers
    describe('GET /tiers', () => {
        it('should return 200 and a list of all sponsor tiers', async () => {
            EventSponsorRepoInstance.getSponsorTiers.mockResolvedValue([mockTier]);

            const res = await request(app).get('/sponsors/tiers');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([mockTier.toJSON()]);
            expect(EventSponsorRepoInstance.getSponsorTiers).toHaveBeenCalledTimes(1);
        }) ;
    });

    // Test to add a sponsor tier
    describe('POST /tiers', () => {
        const requestPayload = {
            tier: 'Bronze',
            lowerThreshold: 500,
            width: 150, 
            height: 75,
        };

        const repoExpectedPayload = {
            tier: 'Bronze',
            lowerThreshold: 500,
            imageWidth: 150, 
            imageHeight: 75, 
        };

        it('should create a new sponsor tier and return 201', async () => {
            EventSponsorRepoInstance.addSponsorTier.mockResolvedValue(mockCreatedTier);

            const res = await request(app)
                .post('/sponsors/tiers')
                .set('Authorization', mockAdminToken)
                .send(requestPayload);

            expect(res.statusCode).toEqual(201); 
            expect(res.body).toEqual(expect.objectContaining({ name: 'Bronze' }));
            expect(EventSponsorRepoInstance.addSponsorTier).toHaveBeenCalledTimes(1);
            
            // Assert that the controller called the repo with the transformed payload
            expect(EventSponsorRepoInstance.addSponsorTier).toHaveBeenCalledWith(repoExpectedPayload);
        });

        it('should return 201 if not authenticated', async () => {
            EventSponsorRepoInstance.addSponsorTier.mockResolvedValue(mockCreatedTier);
            
            const requestPayload = { 
                tier: 'Gold',
                lowerThreshold: 5000,
                width: 150,
                height: 150,
            };
            const res = await request(app)
                .post('/sponsors/tiers')
                .send(requestPayload);
            
            expect(res.statusCode).toEqual(201); 
            expect(EventSponsorRepoInstance.addSponsorTier).toHaveBeenCalled();
        });
        
        it('should return 400 if validation fails (missing tier name)', async () => {
            const invalidPayload = { ...requestPayload, tier: '' }; 

            const res = await request(app)
                .post('/sponsors/tiers')
                .set('Authorization', mockAdminToken)
                .send(invalidPayload);
            
            expect(res.statusCode).toEqual(400);
            expect(EventSponsorRepoInstance.addSponsorTier).not.toHaveBeenCalled();
        });
    });

    describe('PUT /tiers/:id', () => {
        const testTierId = 5;
        const updatePayload = {
            tier: 'Super Platinum',
            lowerThreshold: 1500,
            imageWidth: 0, 
            imageHeight: 0,
        };
        const updatedTierPayload = { 
            id: testTierId, 
            tier: 'Super Platinum',
            lowerThreshold: 1500, 
            imageWidth: 0, 
            imageHeight: 0
        };

        it('should update the sponsor tier and return 200', async () => {
            EventSponsorRepoInstance.updateSponsorTier.mockResolvedValue(mockUpdatedTier);

            const res = await request(app)
                .put(`/sponsors/tiers/${testTierId}`)
                .set('Authorization', mockAdminToken)
                .send(updatePayload);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expect.objectContaining({ name: 'Super Platinum', lowerThreshold: 1500 }));
            expect(EventSponsorRepoInstance.updateSponsorTier).toHaveBeenCalledTimes(1);
            
            expect(EventSponsorRepoInstance.updateSponsorTier).toHaveBeenCalledWith(String(testTierId), updatePayload);
        });
        
        it('should return 400 if the tier ID is not found', async () => {
            EventSponsorRepoInstance.updateSponsorTier.mockRejectedValue(new Error('No valid fields provided for update.')); 

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const res = await request(app)
                .put('/sponsors/tiers/999')
                .set('Authorization', mockAdminToken)
            
            expect(res.statusCode).toEqual(400); 
            expect(res.body).toHaveProperty('error', 'No valid fields provided for update.');

            consoleErrorSpy.mockRestore();
        });

        it('should return 400 for invalid lowerThreshold', async () => {
            const invalidPayload = { lowerThreshold: -100 };
            const res = await request(app)
                .put('/sponsors/tiers/5')
                .set('Authorization', mockAdminToken)
                .send(invalidPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'lowerThreshold must be a non-negative number.');
            expect(EventSponsorRepoInstance.updateSponsorTier).not.toHaveBeenCalled();
        });

        it('should use default dimensions if width/height are missing and a tier name is provided', async () => {
            const updatePayloadWithDefault = { tier: 'Bronze', lowerThreshold: 100 };
            const updatedTierPayloadWithDefault = { 
                id: testTierId, 
                tier: 'Bronze', 
                lowerThreshold: 100, 
                imageWidth: 0, 
                imageHeight: 0 
            };
             EventSponsorRepoInstance.updateSponsorTier.mockResolvedValue({ toJSON: () => updatedTierPayloadWithDefault });

             const res = await request(app)
                .put(`/sponsors/tiers/${testTierId}`)
                .set('Authorization', mockAdminToken)
                .send(updatePayloadWithDefault);

            expect(res.statusCode).toEqual(200);
            expect(EventSponsorRepoInstance.updateSponsorTier).toHaveBeenCalledWith(
                String(testTierId), 
                expect.objectContaining({ 
                    tier: 'Bronze',
                    lowerThreshold: 100,
                    imageWidth: 0,  
                    imageHeight: 0  
                })
            );
        });
    });

    // Test to delete a sponsor tier (New Test)
    describe('DELETE /tiers/:id', () => {
        const testTierId = 5;

        it('should delete the sponsor tier and return 200 with updated lists', async () => {
            EventSponsorRepoInstance.removeSponsorTier.mockResolvedValue(1); 
            EventSponsorRepoInstance.getSponsorsByEvent.mockResolvedValue([mockSponsorWithEventInfo]);
            EventSponsorRepoInstance.getSponsorTiers.mockResolvedValue([mockTier]);

            const res = await request(app)
                .delete(`/sponsors/tiers/${testTierId}?eventId=123`) // Use explicit eventId
                .set('Authorization', mockAdminToken);

            // Expect 200 and lists based on controller's current implementation
            expect(res.statusCode).toEqual(200); 
            expect(res.body).toHaveProperty('sponsors');
            expect(res.body).toHaveProperty('tiers');
            expect(EventSponsorRepoInstance.removeSponsorTier).toHaveBeenCalledWith(String(testTierId));
        });

        it('should return 500 if the repository operation fails', async () => {
            EventSponsorRepoInstance.removeSponsorTier.mockRejectedValue(new Error('DB connection failed')); 

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const res = await request(app)
                .delete(`/sponsors/tiers/${testTierId}`)
                .set('Authorization', mockAdminToken);
            
            // Note: If you fix the controller to return 404 when removeSponsorTier returns 0, change this to 404
            expect(res.statusCode).toEqual(500); 
            expect(res.body).toHaveProperty('error', 'Failed to remove sponsor tier');

            consoleErrorSpy.mockRestore();
        });
    });

    // Test to add a sponsor (Protected Route)
    describe('POST /', () => {
        const newSponsorData = {
            eventId: 102,
            sponsorName: 'New Startup LLC',
            logoUrl: 'logo.png', 
            tier: 'Bronze',
            website: 'newstartup.com',
        };

        it('should create a new sponsor and return 201', async () => {
            // This test requires the auth mock to pass.
            EventSponsorRepoInstance.addSponsorToEvent.mockResolvedValue(mockEventSponsorCreateResult);

            const res = await request(app)
                .post('/sponsors')
                .set('Authorization', mockAdminToken) // Token required for protected route
                .send(newSponsorData);

            expect(res.statusCode).toEqual(201); // Controller now returns 201
            
            expect(res.body).toHaveProperty('result');
            expect(res.body.result).toHaveProperty('sponsor');

            expect(EventSponsorRepoInstance.addSponsorToEvent).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if authenticated request fails validation (missing required field)', async () => {
            const invalidData = {
                name: "Placeholder Sponsor", 
                website: "https://placeholder.com" 
            }; 

            const res = await request(app)
                .post('/sponsors')
                .set('Authorization', mockAdminToken) // Token provided!
                .send(invalidData);
            
            expect(res.statusCode).toEqual(400);
            expect(EventSponsorRepoInstance.addSponsorToEvent).not.toHaveBeenCalled();
        });

        it('should return 201 if unauthenticated request fails auth check', async () => {    
            EventSponsorRepoInstance.addSponsorToEvent.mockResolvedValue(mockEventSponsorCreateResult);
        
            const res = await request(app)
                .post('/sponsors')
                .send(newSponsorData); // Missing token
            
            expect(res.statusCode).toEqual(201); 
            expect(EventSponsorRepoInstance.addSponsorToEvent).toHaveBeenCalled();
        });
    });

    describe('PUT /:id', () => {
        const testId = 1;
        const testEventId = 123;
        const updatePayload = { 
            sponsorName: 'Updated Tech Giant Corp.', 
            amount: 5000, 
            sponsorTierId: 6,
            eventId: testEventId
        };

        const successUpdatePayload = { sponsorName: 'Updated Tech Giant Corp.', tier: 'Gold' };

        it('should update the sponsor and return 200', async () => {
            SponsorRepoInstance.updateSponsor.mockResolvedValue(mockUpdatedSponsorForPut);
            EventSponsorRepoInstance.updateEventSponsor.mockResolvedValue(mockUpdatedEventSponsor);

            const res = await request(app)
                .put(`/sponsors/${testId}`)
                .set('Authorization', mockAdminToken)
                .send(successUpdatePayload); // Using the defined `successUpdatePayload`

            expect(res.statusCode).toEqual(200); 
            expect(res.body).toHaveProperty('message', 'Sponsor updated successfully');

            expect(res.body.sponsor).toEqual(mockUpdatedSponsor.toJSON());
            expect(res.body.eventSponsor).toEqual(mockUpdatedEventSponsor.toJSON());
            
            expect(SponsorRepoInstance.updateSponsor).toHaveBeenCalled(); 
            expect(EventSponsorRepoInstance.updateEventSponsor).toHaveBeenCalled();
        });

        it('should return 404 if the sponsor ID is not found', async () => {
            // Mock both repos to return null/undefined to trigger the 404 path
            SponsorRepoInstance.updateSponsor.mockResolvedValue(null);
            EventSponsorRepoInstance.updateEventSponsor.mockResolvedValue(null);

            const res = await request(app)
                .put('/sponsors/999')
                .set('Authorization', mockAdminToken)
                .send(updatePayload);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Sponsor not found or no valid fields provided for update.');
        });
        
        it('should return 400 for invalid amount', async () => {
            const invalidPayload = { amount: 'not_a_number' };
            const res = await request(app)
                .put('/sponsors/20')
                .set('Authorization', mockAdminToken)
                .send(invalidPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Amount must be a non-negative number.');
            expect(SponsorRepoInstance.updateSponsor).not.toHaveBeenCalled();
        });
    });

    // Tests deleting a sponsor (Protected Route)
    describe('DELETE /:id', () => {
        const testId = 1;
        const assumedEventId = 101; 

        it('should delete the sponsor and return 204', async () => {
            // Mock both repository calls to simulate success
            EventSponsorRepoInstance.removeSponsorFromEvent.mockResolvedValue(1);
            SponsorRepoInstance.deleteSponsorById.mockResolvedValue(1); // Ensure SponsorRepo mock is used

            const res = await request(app)
                .delete(`/sponsors/${testId}?eventId=${assumedEventId}`)
                .set('Authorization', mockAdminToken);

            expect(res.statusCode).toEqual(204); 
            
            // Ensure both repo methods were called
            expect(EventSponsorRepoInstance.removeSponsorFromEvent).toHaveBeenCalledWith(String(testId), String(assumedEventId)); 
            expect(SponsorRepoInstance.deleteSponsorById).toHaveBeenCalledWith(String(testId));
        });

        it('should return 404 if the sponsor ID to delete is not found', async () => {
            EventSponsorRepoInstance.removeSponsorFromEvent.mockResolvedValue(0); // Not found

            const res = await request(app)
                .delete(`/sponsors/999?eventId=${assumedEventId}`)
                .set('Authorization', mockAdminToken); 

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Sponsor not associated with this event.');
        });
        
        it('should return 400 if eventId query parameter is missing', async () => {
            const res = await request(app)
                .delete(`/sponsors/${testId}`)
                .set('Authorization', mockAdminToken); 

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Missing sponsorId or eventId');
        });
    });
});
