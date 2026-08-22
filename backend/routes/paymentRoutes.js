const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Agreement = require('../models/Agreement');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PAYMENT_AMOUNT = Number(process.env.AGREEMENT_PAYMENT_AMOUNT || 100);
const PAYMENT_AMOUNT_PAISE = PAYMENT_AMOUNT * 100;

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { agreementId } = req.body;
    if (!agreementId) {
      return res.status(400).json({ message: 'Agreement ID required' });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    if (agreement.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to pay for this agreement' });
    }

    if (agreement.paymentStatus === 'paid') {
      return res.json({ alreadyPaid: true, agreement });
    }

    const order = await razorpay.orders.create({
      amount: PAYMENT_AMOUNT_PAISE,
      currency: agreement.currency || 'INR',
      receipt: `agreement_${agreement._id}`,
      notes: { agreementId: agreement._id.toString() },
    });

    agreement.razorpayOrderId = order.id;
    await agreement.save();

    res.json({
      order,
      key: process.env.RAZORPAY_KEY_ID,
      amount: PAYMENT_AMOUNT,
      currency: agreement.currency || 'INR',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment details required' });
    }

    const agreement = await Agreement.findOne({ razorpayOrderId });
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    if (agreement.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to verify this payment' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    agreement.paymentStatus = 'paid';
    agreement.razorpayPaymentId = razorpayPaymentId;
    agreement.razorpaySignature = razorpaySignature;
    agreement.paidAt = new Date();
    if (!agreement.agreementLinkToken) {
      agreement.agreementLinkToken = uuidv4();
    }
    await agreement.save();

    res.json({ message: 'Payment verified successfully', agreement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const webhookHandler = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');
    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
  } else {
    console.warn('RAZORPAY_WEBHOOK_SECRET not set — webhook signature verification skipped');
  }

  try {
    let event;
    try {
      event = JSON.parse(req.body.toString());
    } catch (parseErr) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const eventName = event.event;
    let entity = null;
    let orderId = null;

    if (eventName === 'payment.captured' || eventName === 'payment.failed') {
      entity = event.payload && event.payload.payment ? event.payload.payment.entity : null;
      orderId = entity ? entity.order_id : null;
    } else if (eventName === 'order.paid') {
      entity = event.payload && event.payload.order ? event.payload.order.entity : null;
      orderId = entity ? entity.id : null;
    } else if (eventName === 'refund.processed') {
      entity = event.payload && event.payload.refund ? event.payload.refund.entity : null;
      orderId = entity ? entity.order_id : null;
    }

    if (!orderId) {
      return res.json({ received: true });
    }

    const agreement = await Agreement.findOne({ razorpayOrderId: orderId });
    if (!agreement) {
      return res.json({ received: true });
    }

    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      if (agreement.paymentStatus !== 'paid') {
        agreement.paymentStatus = 'paid';
        agreement.razorpayPaymentId = entity.id || agreement.razorpayPaymentId;
        agreement.paidAt = new Date();
        if (!agreement.agreementLinkToken) {
          agreement.agreementLinkToken = uuidv4();
        }
        await agreement.save();
        console.log(`Webhook: agreement ${agreement._id} marked paid (${eventName})`);
      }
    } else if (eventName === 'refund.processed' && agreement.paymentStatus === 'paid') {
      agreement.paymentStatus = 'pending';
      agreement.razorpayPaymentId = null;
      agreement.razorpaySignature = null;
      agreement.paidAt = null;
      agreement.agreementLinkToken = undefined;
      await agreement.save();
      console.log(`Webhook: agreement ${agreement._id} marked pending after refund`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { router, webhookHandler };
