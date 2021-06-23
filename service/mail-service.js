const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }
    /**
     * Send an account activation link by email
     * @param {String} to Recipient email
     * @param {String} link Account activation link
     */
    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Confirm your email address`,
            text: '',
            html:
                `
                <div>
                Hello,<br> Please click on the link to verify your email.<br><a href=${link}>Click here to verify</a>
                </div>
            `
        })
    };
}

module.exports = new MailService();