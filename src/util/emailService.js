const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.EMAIL_API_KEY;

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

module.exports = { sendRegistrationConfirmation };
