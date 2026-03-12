const brevo = require('@getbrevo/brevo');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userRepo = require('../repository/user/UserRepo')

dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.EMAIL_API_KEY;

const transporter = nodemailer.createTransport({ //switch this out with the SMTP Server being used at the time
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "pedro90@ethereal.email",
        pass: "xuSDSxRnzgNSDd51Wu"
    }
});

const JWT_SECRET = process.env.NEW_EMAIL_API_KEY || 'your-secret-key';
const JWT_SECRET_PASSWORD = process.env.PASSWORD || 'your-secret-key';
async function verificationEmail(email, emailToken) {
    try {
        const info = await transporter.sendMail({
            from: '"Ethan Nelson" <pedro90@ethereal.email>',
            to: email,
            subject: "Verify your email",
            html: `
    <h2>Email Verification</h2>
    <p>Click the link below to verify your account:</p>
    <a href="http://localhost:3000/verify/verify-email?token=${emailToken}">
      Verify Email
    </a>
  `
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendPasswordResetEmail(email, resetToken) {
    try {
        const info = await transporter.sendMail({
            from: '"Ethan Nelson" <pedro90@ethereal.email>',
            to: email,
            subject: "Reset Password",
            html: `
    <h2>Email Verification</h2>
    <p>Click the link below to Reset your password:</p>
    <a href="http://localhost:8080/passwordRecovery?token=${encodeURIComponent(resetToken)}">
      Reset Password
    </a>
  `
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendRegistrationConfirmation(to, firstName) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { email: process.env.FROM_EMAIL, name: 'YCP Hacks' };

    // This is the ID of the template we created through Brevo's website
    sendSmtpEmail.templateId = 1;

    // These correspond to variables in the template
    sendSmtpEmail.params = {
        firstName: firstName
    };

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


function generateEmailToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function generatePasswordToken(payload) {
    return jwt.sign(payload, JWT_SECRET_PASSWORD, { expiresIn: '5m' });
}
function validateEmailToken(token) {
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        return {valid: true, decoded: decoded}
    } catch (err) {
        return { valid: false, error: err.message };  // Return error if invalid
    }
}
function validatePasswordToken(token) {
    try {
        const decoded = jwt.verify(token,JWT_SECRET_PASSWORD);
        return {valid: true, decoded: decoded}
    } catch (err) {
        return { valid: false, error: err.message };  // Return error if invalid
    }
}


module.exports = { sendRegistrationConfirmation, generateEmailToken, validateEmailToken, validatePasswordToken, verificationEmail, sendPasswordResetEmail, generatePasswordToken};
