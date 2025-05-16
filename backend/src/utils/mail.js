import { config } from 'dotenv';
import nodemailer from 'nodemailer';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Not recommended for production
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Email server verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

const sendAccountVerificationEmail = async (email, names, verificationToken) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'NE NodeJS Account Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Dear ${names},</h2>
          <h2>To verify your account, click the link below or use the code below</h2>
          <strong>Verification code: ${verificationToken}</strong> <br/> or
          <a href="${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}" style="color:#4200FE;letter-spacing: 2px;">Click here</a>
          <span>The code expires in 6 hours</span>
          <p>Best regards,<br>NE NodeJS</p>
        </body>
        </html>
      `,
    });

    return {
      message: 'Email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      message: 'Unable to send email',
      status: false,
    };
  }
};

const sendPaswordResetEmail = async (email, names, passwordResetToken) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'NE NodeJS Password Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Dear ${names},</h2>
          <h2>Click the link below to change your password or use the code below</h2>
          <strong>Reset code: ${passwordResetToken}</strong> <br/> or
          <a href="${process.env.CLIENT_URL}/auth/reset-password/${passwordResetToken}" style="color:#4200FE;letter-spacing: 2px;">Click here</a>
          <span>The code expires in 6 hours</span>
          <p>Best regards,<br>NE NodeJS</p>
        </body>
        </html>
      `,
    });

    return {
      message: 'Email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      message: 'Unable to send email',
      status: false,
    };
  }
};

export { sendAccountVerificationEmail, sendPaswordResetEmail };
