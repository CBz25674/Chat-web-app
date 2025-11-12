const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.pass
    }
});

module.exports = mailer;