const { EventParticipant, User } = require('../config/Models');  // Adjust the path based on your folder structure
const EventParticipantRepo = require('../team/EventParticipantRepo');

const UserRepo = {
    // Method to create a new user
    async create(user) {
        return User.create(user);
    },

    // Method to find a user by email
    async findByEmail(email) {
        return await User.findOne({
            where: { email }
        });
    },
    async getAllUsers() {
        return await User.findAll();
    },
    async getUsersByEvent(eventId) {
        return EventParticipantRepo.getUsersByEvent(eventId);
    },

    async updateCheckInStatus(userId, checkInStatus){
        const user = await User.findByPk(userId);

        if(!user){
            const error = new Error(`User with ID ${userId} not found.`);
            error.status = 404;
            throw error;
        }

        user.checkIn = checkInStatus;

        await user.save();
        return user;
    },

    async updateUserById(userId, updateData){
        try{
            const [rowsAffected] = await User.update(updateData, {
                where: {
                    id: userId
                }
            });
            return [rowsAffected];
        }catch(err){
            console.error(`Error in repo updating user ${userId}:`, err);
        }
    },
    async checkIfBanned({ firstName, lastName, email }) {
        // We only need to normalize email for Sequelize query consistency
        const normalizedEmail = email.trim().toLowerCase();

        // The logic: Find a user record where the email matches AND the user is banned.
        // The firstName/lastName check is optional but good for verification.
        const bannedUser = await User.findOne({
            where: {
                email: normalizedEmail,
                isBanned: true // 🚨 Use the confirmed 'isBanned' column
            }
        });

        // Return true if a banned record is found
        return !!bannedUser; 
    },
    async getStaffForEvent(eventId) {
        try {
            const staffUsers = await User.findAll({
                // Find users who are marked as 'staff'
                where: {
                    role: 'staff'
                },
                // Include EventParticipant data and filter by eventId
                include: [{
                    model: EventParticipant,
                    as: 'participant',
                    required: true,
                    where: {
                        eventId: eventId
                    },
                    attributes: []
                }],
                attributes: [
                    'id',
                    'firstName',
                    'lastName'
                ],
                order: [
                    ['lastName', 'ASC']
                ]
            });

            return staffUsers;
        } catch (error) {
            console.error("Error fetching staff for event:", error);
            throw new Error('Failed to retrieve staff list.');
        }
    }
};

module.exports = UserRepo;
