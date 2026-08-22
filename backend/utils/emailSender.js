const nodemailer = require('nodemailer');
const path = require('path');

let transporter = null;

const initTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log(`Ethereal Mail Account: ${testAccount.user}`);
  console.log(`Ethereal Mail Password: ${testAccount.pass}`);
  return transporter;
};

const sendAgreementEmail = async (toEmail, subject, agreement, pdfPath) => {
  if (!transporter) {
    await initTransporter();
  }

  const mailOptions = {
    from: '"AgreeKaro" <agreements@example.com>',
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Agreement Confirmation</h2>
        <p>Your agreement has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Client Name:</td><td style="padding: 8px;">${agreement.clientName || 'N/A'}</td></tr>
          <tr style="background: #f8f8f8;"><td style="padding: 8px; font-weight: bold;">Project Title:</td><td style="padding: 8px;">${agreement.title}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Payment Amount:</td><td style="padding: 8px;">₹${agreement.price}</td></tr>
          <tr style="background: #f8f8f8;"><td style="padding: 8px; font-weight: bold;">Payment Schedule:</td><td style="padding: 8px;">Advance ₹${agreement.advanceAmount ?? 'N/A'} | Before Delivery ₹${agreement.beforeDeliveryAmount ?? 'N/A'} | After Delivery ₹${agreement.afterDeliveryAmount ?? 'N/A'}</td></tr>
        </table>
        <p style="margin-top: 20px;">Please find the signed agreement PDF attached to this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email from AgreeKaro.</p>
      </div>
    `,
    attachments: pdfPath ? [{
      filename: `agreement_${agreement._id}.pdf`,
      path: pdfPath,
    }] : [],
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`\nEmail sent to ${toEmail}`);
  console.log(`Preview URL: ${previewUrl}\n`);
  return { messageId: info.messageId, previewUrl };
};

module.exports = { initTransporter, sendAgreementEmail };
