const express = require('express');
const fs = require('fs');
const Agreement = require('../models/Agreement');
const authMiddleware = require('../middleware/authMiddleware');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { generatePDF, PDF_VERSION } = require('../utils/pdfGenerator');
const { sendAgreementEmail } = require('../utils/emailSender');

const router = express.Router();

const generateAgreementID = () => {
  return 'AK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      clientName, clientEmail, clientMobile, clientAddress,
      title, description, deliverables, timeline, revisions, additionalTerms,
      price, advanceAmount, beforeDeliveryAmount, afterDeliveryAmount,
      freelancerName, freelancerEmail, freelancerPhone, freelancerAddress
    } = req.body;
    if (!clientName || !title || !deliverables || !price || !freelancerEmail || !freelancerPhone) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
    const agreement = await Agreement.create({
      agreementID: generateAgreementID(),
      clientName, clientEmail, clientMobile, clientAddress,
      title, description, deliverables, timeline, revisions, additionalTerms,
      price, advanceAmount, beforeDeliveryAmount, afterDeliveryAmount,
      freelancerName, freelancerEmail, freelancerPhone, freelancerAddress,
      client: req.user._id
    });
    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const created = await Agreement.find({ client: req.user._id }).sort({ createdAt: -1 });
    const received = await Agreement.find({ freelancerEmail: req.user.email }).sort({ createdAt: -1 });

    const createdIds = new Set(created.map(a => a._id.toString()));
    const allAgreements = [...created];
    received.forEach(a => {
      if (!createdIds.has(a._id.toString())) {
        allAgreements.push(a);
      }
    });

    allAgreements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ agreements: allAgreements, createdCount: created.length, receivedCount: received.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/:token', async (req, res) => {
  try {
    const agreement = await Agreement.findOne({ agreementLinkToken: req.params.token }).select('-client');
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const sendPdf = async (agreement, res) => {
  let pdfPath = agreement.pdfPath;
  if (!pdfPath || !fs.existsSync(pdfPath) || !pdfPath.includes(`_v${PDF_VERSION}_`)) {
    pdfPath = await generatePDF(agreement);
    agreement.pdfPath = pdfPath;
    await agreement.save();
  }
  res.download(pdfPath, `agreement_${agreement._id}.pdf`);
};

router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    const isCreator = agreement.client.toString() === req.user._id.toString();
    const isFreelancer = agreement.freelancerEmail === req.user.email;
    if (!isCreator && !isFreelancer) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await sendPdf(agreement, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/:token/pdf', async (req, res) => {
  try {
    const agreement = await Agreement.findOne({ agreementLinkToken: req.params.token });
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    await sendPdf(agreement, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { phone, agreementId } = req.body;
    if (!phone || !agreementId) {
      return res.status(400).json({ message: 'Phone and agreement ID required' });
    }
    const otpDoc = await createOTP(phone, agreementId);
    res.json({ message: 'OTP sent successfully', devOtp: otpDoc.otp, expiresAt: otpDoc.expiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, agreementId } = req.body;
    if (!phone || !otp || !agreementId) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const isValid = await verifyOTP(phone, otp, agreementId);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accept/:token', async (req, res) => {
  try {
    const { freelancerName, freelancerEmail, freelancerPhone, freelancerAddress } = req.body;
    const agreement = await Agreement.findOne({ agreementLinkToken: req.params.token });
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    if (agreement.status === 'accepted') {
      return res.status(400).json({ message: 'Agreement already accepted' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    let browser = 'Unknown';
    let os = 'Unknown';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    agreement.status = 'accepted';
    if (freelancerName) agreement.freelancerName = freelancerName;
    if (freelancerAddress) agreement.freelancerAddress = freelancerAddress;
    agreement.acceptanceDetails = {
      freelancerName,
      freelancerEmail: freelancerEmail || agreement.freelancerEmail,
      freelancerPhone: freelancerPhone || agreement.freelancerPhone,
      ipAddress,
      deviceBrowser: browser,
      deviceOS: os,
      acceptedAt: new Date(),
      otpVerified: true
    };

    const pdfPath = await generatePDF(agreement);
    agreement.pdfPath = pdfPath;
    await agreement.save();

    try {
      await sendAgreementEmail(agreement.freelancerEmail, 'Agreement Signed Successfully', agreement, pdfPath);
      if (agreement.client) {
        const User = require('../models/User');
        const client = await User.findById(agreement.client);
        if (client) {
          await sendAgreementEmail(client.email, 'Agreement Signed by Freelancer', agreement, pdfPath);
        }
      }
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.json({ message: 'Agreement accepted successfully', agreement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
