const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  agreementID: { type: String },
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  clientMobile: { type: String },
  clientAddress: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  deliverables: { type: String, required: true },
  timeline: { type: String, default: '' },
  revisions: { type: String },
  additionalTerms: { type: String },
  price: { type: Number, required: true },
  advanceAmount: { type: Number },
  beforeDeliveryAmount: { type: Number },
  afterDeliveryAmount: { type: Number },
  freelancerName: { type: String },
  freelancerEmail: { type: String, required: true },
  freelancerPhone: { type: String, required: true },
  freelancerAddress: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentAmount: { type: Number, default: 100 },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paidAt: { type: Date },
  agreementLinkToken: { type: String, unique: true, sparse: true },
  acceptanceDetails: {
    freelancerName: String,
    freelancerEmail: String,
    freelancerPhone: String,
    ipAddress: String,
    deviceBrowser: String,
    deviceOS: String,
    acceptedAt: Date,
    otpVerified: Boolean
  },
  pdfPath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agreement', agreementSchema);
