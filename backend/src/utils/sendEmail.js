// src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Gracefully skip email when SMTP is not configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.warn('Email not configured (missing EMAIL_HOST/EMAIL_USERNAME/EMAIL_PASSWORD). Skipping email send.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Accept either options.email or options.to for recipient
    const recipient = options.email || options.to;
    if (!recipient) {
      throw new Error('No recipient provided for email');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'PureLiving'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: recipient,
      subject: options.subject,
      text: options.text || options.message,
      html: options.html || (options.message && options.message.replace(/\n/g, '<br>'))
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient}, ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;