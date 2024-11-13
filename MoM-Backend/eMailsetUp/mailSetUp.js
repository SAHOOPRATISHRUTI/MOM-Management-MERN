const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pratishrutisahoo7@gmail.com',
        pass: 'qtocksdefwbqyvup',
      },
    });

    let mailOptions = {
      from: 'pratishrutisahoo7@gmail.com',
      to: email,
      subject: 'Your OTP Code for Verification',
      text: `Your OTP code is ${otp}. It will expire in 5 mins.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};