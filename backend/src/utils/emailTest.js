// src/utils/emailTest.js
require('dotenv').config();
const sendEmail = require('./sendEmail');

console.log('==== Email Test Script ====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Starting email test...');

const testEmail = async () => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USERNAME, // Send to yourself for testing
      subject: 'PureLiving Email Test',
      text: 'This is a test email to verify your email configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #14b8a6;">PureLiving Email Test</h1>
          <p>This is a test email to verify that your email service is working correctly.</p>
          <p>Your email configuration appears to be working!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    console.log('Test email completed successfully!');
  } catch (error) {
    console.error('Test email failed:', error);
  }
};

testEmail();