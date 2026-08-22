const Otp = require('../models/Otp');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createOTP = async (phone, agreementId) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({ phone, agreementId });

  const otpDoc = await Otp.create({ phone, otp, agreementId, expiresAt });

  console.log(`\n====================================`);
  console.log(`OTP for ${phone}: ${otp}`);
  console.log(`Expires at: ${expiresAt.toLocaleString()}`);
  console.log(`====================================\n`);

  return otpDoc;
};

const verifyOTP = async (phone, otp, agreementId) => {
  const otpDoc = await Otp.findOne({
    phone,
    otp,
    agreementId,
    expiresAt: { $gt: new Date() }
  });

  if (!otpDoc) {
    return false;
  }

  await Otp.deleteOne({ _id: otpDoc._id });
  return true;
};

module.exports = { createOTP, verifyOTP };
