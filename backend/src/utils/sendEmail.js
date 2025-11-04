// src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Log environment variables for debugging
    console.log('Email configuration:');
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`Username: ${process.env.EMAIL_USERNAME}`);
    console.log(`From: ${process.env.EMAIL_FROM}`);
    
    // Create transporter with more detailed configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true, // Keep for debugging
      logger: true  // Keep for debugging
    });

    // Verify connection configuration
    console.log('Verifying email transport configuration...');
    await transporter.verify();
    console.log('Email transport verification successful');

    // Accept either options.email or options.to for recipient
    const recipient = options.email || options.to;
    if (!recipient) {
      throw new Error('No recipient provided for email');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'PureLiving'}" <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: options.subject,
      text: options.text || options.message,
      html: options.html || (options.message && options.message.replace(/\n/g, '<br>'))
    };

    console.log(`Sending email to: ${recipient}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully, ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;