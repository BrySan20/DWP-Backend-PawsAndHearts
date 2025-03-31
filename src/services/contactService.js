const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (from, to, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Email options
    let mailOptions = {
      from: `${from} <pawsandheartsdwp@gmail.com>`,
      replyTo: from,
      to: "pawsandheartsdwp@gmail.com",
      subject: subject,
      html: `
              <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://res.cloudinary.com/dxkdisqjb/image/upload/v1743410024/nks22iksmhsa6mg3cyby.png" alt="Paws & Hearts Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
                  <h2 style="color: #4a4a4a; margin-top: 0; text-align: center;">New Contact Message</h2>
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin-top: 15px;">
                    <p style="color: #666; margin: 5px 0;"><strong>From:</strong> ${from}</p>
                    <p style="color: #666; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                    <hr style="border: 0; height: 1px; background-color: #e3e3e3; margin: 15px 0;">
                    <div style="color: #666; line-height: 1.5;">
                      ${body.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e3e3e3; text-align: center; color: #888; font-size: 12px;">
                  <p style="margin-bottom: 5px;"><strong>Paws & Hearts</strong></p>
                  <p>&copy; 2025 Paws & Hearts. All rights reserved.</p>
                </div>
              </div>
            `
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendEmail
};