const UserRepoModel = require('../repository/user/User')
const UserRepo = require('../repository/user/UserRepo')
const User = require('../models/User')
const UserResponseDto = require('../dto/UserResponseDto')
const { generateToken, validateToken} = require('../util/JWTUtil');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;  // Number of salt rounds for bcrypt
const { sendRegistrationConfirmation } = require('../util/emailService');
const EventParticipantRepo = require('../repository/team/EventParticipantRepo');
const QRCode = require('qrcode');

/**
 * This function will create a user based on the data that gets sent in and return
 * the users id, email, first name, and token on success
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const createUser = async (req, res) => {
    try {

        // convert user into user model
        const userData = req.body
        const { eventId } = req.body;

        if(!eventId){
            return res.status(400).json({ message: 'Missing eventId in request body.' });
        }

        const isBanned = await UserRepo.checkIfBanned({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
        });

        if (isBanned) {
            return res.status(403).json({
                message: 'Registration declined: This user has been banned from previous events.',
                errors: { general: 'User is ineligible to register.' }
            });
        }

        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        const user = new User(
            userData.firstName,
            userData.lastName,
            userData.email,
            hashedPassword,
            "participant", // Force participant role initially
            userData.phoneNumber,
            userData.age,
            userData.gender,
            userData.country,
            userData.tShirtSize,
            userData.dietaryRestrictions,
            userData.school,
            userData.major,
            userData.graduationYear,
            userData.levelOfStudy,
            userData.hackathonsAttended,
            userData.linkedInUrl,
            userData.pronouns,
            userData.checkIn,
            userData.mlhCodeOfConduct,
            userData.mlhPrivacyPolicy,
            userData.mlhEmails,
            userData.isVerified
        )

        // validate data
        const validationErrors = user.validate()
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        const existingUser = await UserRepo.findByEmail(user.email);
        if (existingUser){
            return res.status(400).json({
                message: 'Email is already in use please sign in',
                errors: { email: 'Email is already registered' }
            });
        }

        // Converts to plain object for Sequelize
        const userObj = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            role: user.role,
            phoneNumber: user.phoneNumber,
            age: user.age,
            gender: user.gender,
            country: user.country,
            tShirtSize: user.tShirtSize,
            dietaryRestrictions: user.dietaryRestrictions,
            school: user.school,
            major: user.major,
            graduationYear: user.graduationYear,
            levelOfStudy: user.levelOfStudy,
            hackathonsAttended: user.hackathonsAttended,
            linkedInUrl: user.linkedInUrl,
            pronouns: user.pronouns,
            checkIn: user.checkIn,
            mlhCodeOfConduct: user.mlhCodeOfConduct,
            mlhPrivacyPolicy: user.mlhPrivacyPolicy,
            mlhEmails: user.mlhEmails,
            isVerified: user.isVerified
        };

        // persist user  ONLY IF THE DATA IS VALID
        const persistedUser = await UserRepo.create(userObj);

        await EventParticipantRepo.addParticipant(persistedUser.id, eventId);

        // generate JWT
        const token = generateToken({ email: user.email });

        // Fire off confirmation email
        await sendRegistrationConfirmation(user.email, user.firstName);

        // create user response dto
        const userResponseDto = new UserResponseDto(
            persistedUser.id,
            persistedUser.email,
            persistedUser.firstName,
            persistedUser.lastName,
            token,
            user.role
        )

        // send back user response dto
        res.status(201).json({ message: 'Create User successful:', data: userResponseDto });
    } catch (err) {
        // send back any errors (this is where the database errors get thrown)
        res.status(500).json({ message: 'Error persisting user in database:', error: err });
    }
}

/**
 * This function will log in a user by verifying the password
 * if it can find a user with that email, it will return the users
 * id, email, first name, and token on success
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const createQRCode = async (req, res) =>{
    //generate QR code that contains user id
    let userinfo = JSON.stringify(req.params.id);
    try {
        const qrDataUrl = await QRCode.toDataURL(userinfo);
        //sends the QR code to the fronted
        res.json({qr:qrDataUrl});
    } catch (err){
        res.status(500).json({error: 'Failed to generate QR code'});
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await UserRepo.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = generateToken({ email: user.email });

        const userResponseDto = new UserResponseDto(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            token,
            user.role
        )

        // Respond with success and token
        res.status(200).json({
            message: 'Login successful',
            data: userResponseDto
        });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};


const authWithToken = async (req, res) => {
    try {
        const tokenObj = req.body.token;
        const tokenString = (typeof tokenObj === 'object' && tokenObj !== null) ? tokenObj.token : tokenObj;

        // Ensure we actually have a string before proceeding
        if (!tokenString || typeof tokenString !== 'string') {
            return res.status(401).json({ message: 'Missing or malformed token in request body' });
        }
        
        // Validate the token
        const decodedToken = validateToken(tokenString);

        if (decodedToken.error) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Find the user by email
        const user = await UserRepo.findByEmail(decodedToken.email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const userResponseDto = new UserResponseDto(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            tokenString,
            user.role
        )

        // Respond with success and token
        res.status(200).json({
            message: 'Token validated',
            data: userResponseDto
        });
    } catch (err) {
        res.status(500).json({ message: 'Error validating token', error: err.message });
    }
}

const validateQR = async (req, res) => {
    try {
        const { userId } = req.body;

        if(!userId){
            return res.status(400).json({ valid: false});
        }

        const user = await UserRepo.getUsersById(userId);

        if(!user){
            return res.json({ valid: false });
        }
        //update check in status
        await UserRepo.updateCheckInStatus(userId, true);

        //The QR code is valid
        return res.json({ valid: true})

    } catch (err) {
        res.status(500).json({ valid: false});
    }


}

const loginAdminUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await UserRepo.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken({ email: user.email });

        const userResponseDto = new UserResponseDto(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            token,
            user.role,
        )

        if (user.role === 'staff' || user.role === 'oscar') {
            // Respond with success and token
            res.status(200).json({
                message: 'Login successful',
                data: userResponseDto
            });
        } else {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }

}

const getAllUsers = async (req, res) => {
    try {

        const users = await UserRepo.getAllUsers();
        const userData = users.map(user => ({
            id: user.dataValues.id,
            firstName: user.dataValues.firstName,
            lastName: user.dataValues.lastName,
            age: user.dataValues.age,
            email: user.dataValues.email,
            phoneNumber: user.dataValues.phoneNumber,
            school: user.dataValues.school,
            tShirtSize: user.dataValues.tShirtSize,
            dietaryRestrictions: user.dataValues.dietaryRestrictions,
            role: user.dataValues.role,
            checkIn: user.dataValues.checkIn,
            isBanned: user.dataValues.isBanned
        }));

        res.status(200).json({ message: 'Successfully fetched all users', data: userData });
    } catch (err) {
        res.status(500).json({ message: 'Error getting all users', error: err.message });
    }
}

const updateCheckIn = async (req, res) => {
    const userId = Number(req.params.id);

    const { checkIn } = req.body;

    // console.log(`Received userId: ${userId} (Type: ${typeof userId})`);
    // console.log(`Received checkIn: ${checkIn} (Type: ${typeof checkIn})`);

    if (isNaN(userId) || checkIn === undefined || checkIn === null) {
        return res.status(400).json({
            error: 'Invalid or missing user ID or checkIn status (must be boolean) in request.'
        });
    }

    try {
        const updatedUser = await UserRepo.updateCheckInStatus(
            userId,
            !!checkIn 
        );

        return res.status(200).json({ 
            message: `User ${userId} checked in successfully.`,
            data: updatedUser 
        });

    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({ error: error.message });
        }
        
        console.error('Error updating check-in status:', error);
        return res.status(500).json({ error: 'Failed to update user check-in status.' });
    }
}

const updateUserById = async (req, res) => {
    const userId = Number(req.params.id);
    const updatePayload = req.body;

    const allowedFields = [
        'firstName', 'lastName', 'age', 'email', 'phoneNumber', 'school', 
        'tShirtSize', 'dietaryRestrictions', 'role', 'gender', 'country', 
        'hackathonsAttended', 'pronouns', 'isVerified', 'major', 
        'graduationYear', 'levelOfStudy', 'linkedInUrl', 'checkIn', 'isBanned'
    ];

    const sanitizedUpdateData = {};
    for(const key of allowedFields){
        if(updatePayload.hasOwnProperty(key)){
            sanitizedUpdateData[key] = updatePayload[key];
        }
    }

    if(Object.keys(sanitizedUpdateData).length === 0){
        return res.status(400).json({ error: "No valid fields provided for update." });
    }

    try {
        const [rowsAffected] = await UserRepo.updateUserById(userId, sanitizedUpdateData);

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        if(sanitizedUpdateData.hasOwnProperty('isBanned')){
            const isBannedStatus = sanitizedUpdateData.isBanned;

            if(isBannedStatus === true || isBannedStatus === 1){
                const eventId = 1;
                await EventParticipantRepo.assignToTeam(userId, eventId, null);
            }
        }

        // Success response
        return res.status(200).json({ message: "User updated successfully.", data: sanitizedUpdateData });

    } catch (error) {
        console.error("Controller Error during user update:", error);
        // Send a generic error or a more specific one if validation failed before the try block
        return res.status(500).json({ error: "Failed to update user due to a server error." });
    }
}

module.exports = {
    createUser,
    createQRCode,
    loginUser,
    authWithToken,
    loginAdminUser,
    getAllUsers,
    updateCheckIn,
    updateUserById,
    validateQR
}