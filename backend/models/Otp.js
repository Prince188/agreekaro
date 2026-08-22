const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  agreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agreement', required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', otpSchema);
