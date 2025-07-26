const nodemailer = require('nodemailer');

async function sendRepairNotification(to, subject, message) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kkrdc-abss@lotuss.com', // ใช้อีเมลจริง
            pass: 'AbSS@9xx'              // ใช้รหัสผ่านจริง
        }
    });

    await transporter.sendMail({
        from: '"Repair System" <kkrdc-abss@lotuss.com>',
        to,
        subject,
        text: message
    });
}

module.exports = sendRepairNotification;
