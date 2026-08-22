const express = require('express');
const Agreement = require('../models/Agreement');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalAgreements, pending, accepted, paid] = await Promise.all([
      User.countDocuments({}),
      Agreement.countDocuments({}),
      Agreement.countDocuments({ status: 'pending' }),
      Agreement.countDocuments({ status: 'accepted' }),
      Agreement.countDocuments({ paymentStatus: 'paid' })
    ]);

    const revenueAgg = await Agreement.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paymentAmount' }, agreementValue: { $sum: '$price' } } }
    ]);

    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).select('-password');
    const recentAgreements = await Agreement.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalUsers,
        totalAgreements,
        pending,
        accepted,
        paid,
        unpaid: totalAgreements - paid,
        revenue: revenueAgg[0]?.total || 0,
        agreementValue: revenueAgg[0]?.agreementValue || 0
      },
      recentUsers,
      recentAgreements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    const counts = await Promise.all(
      users.map(u => Agreement.countDocuments({ client: u._id }))
    );
    const usersWithCounts = users.map((u, i) => ({
      ...u.toObject(),
      agreementsCreated: counts[i]
    }));
    res.json({ users: usersWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/agreements', async (req, res) => {
  try {
    const agreements = await Agreement.find({})
      .sort({ createdAt: -1 })
      .populate('client', 'name email');
    res.json({ agreements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
