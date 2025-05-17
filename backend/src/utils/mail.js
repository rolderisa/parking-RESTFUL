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
      subject: 'ParkLot Account Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Dear ${names},</h2>
          <h2>To verify your account, click the link below or use the code below</h2>
          <strong>Verification code: ${verificationToken}</strong> <br/> or
          <a href="${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}" style="color:#4200FE;letter-spacing: 2px;">Click here</a>
          <span>The code expires in 6 hours</span>
          <p>Best regards,<br>ParkLot</p>
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
      subject: 'ParkLot Password Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Dear ${names},</h2>
          <h2>Click the link below to change your password or use the code below</h2>
          <strong>Reset code: ${passwordResetToken}</strong> <br/> or
          <a href="${process.env.CLIENT_URL}/auth/reset-password/${passwordResetToken}" style="color:#4200FE;letter-spacing: 2px;">Click here</a>
          <span>The code expires in 6 hours</span>
          <p>Best regards,<br>ParkLot</p>
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
const sendBookingStatusEmail = async (email, names, status) => {
  const subject =
    status === 'APPROVED' ? 'Your booking has been approved' : 'Your booking has been rejected';

  const message =
    status === 'APPROVED'
      ? `Hi ${names},<br/><br/>Your booking request has been <strong>approved</strong>. You can now access your reserved parking slot.<br/><br/>Thanks for using ParkLot!`
      : `Hi ${names},<br/><br/>We're sorry to inform you that your booking request has been <strong>rejected</strong>. If you have any questions, please contact support.<br/><br/>Best regards,<br/>ParkLot Team`;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          ${message}
        </body>
        </html>
      `,
    });

    return {
      message: 'Booking status email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending booking status email:', error);
    return {
      message: 'Unable to send booking status email',
      status: false,
    };
  }
};
const sendNewBookingRequestEmail = async (adminEmail, user, parkingSlot) => {
  const subject = '🚗 New Parking Slot Request';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>New Booking Request Received</h2>
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p><strong>Plate Number:</strong> ${user.plateNumber || 'N/A'}</p>
      <p><strong>Requested Slot:</strong> ${parkingSlot.name || 'Unknown Slot'}</p>
      <p>Please review and take action in the admin panel.</p>
      <br>
      <p>— ParkLot System</p>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: adminEmail,
      subject,
      html: htmlContent,
    });

    return {
      message: 'Admin notified of new booking',
      status: true,
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      message: 'Failed to notify admin',
      status: false,
    };
  }
};


export { sendAccountVerificationEmail, sendPaswordResetEmail,sendBookingStatusEmail,sendNewBookingRequestEmail };
