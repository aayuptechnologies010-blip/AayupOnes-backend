const Reimbursement = require('../models/Reimbursement');
const Employee = require('../models/Employee');

/**
 * GET /api/reimbursements
 * List reimbursement claims with filters & metrics
 */
exports.getReimbursements = async (req, res) => {
  try {
    const { status = 'All', search = '' } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status.toUpperCase();
    }

    let records = [];
    try {
      records = await Reimbursement.find(query)
        .populate('userId', 'fullName employeeId department designation email')
        .sort({ createdAt: -1 });
    } catch (e) {
      console.warn('MongoDB reimbursement query:', e.message);
    }

    let formatted = records.map(r => {
      const u = r.userId || {};
      const statusStr = (r.status || 'PENDING').charAt(0).toUpperCase() + (r.status || 'PENDING').slice(1).toLowerCase();

      return {
        id: r._id ? r._id.toString() : r.id,
        claimId: r.id || (r._id ? `CLM-${r._id.toString().slice(-4).toUpperCase()}` : 'CLM-9000'),
        employeeName: u.fullName || r.employeeName || '',
        employeeId: u.employeeId || r.employeeId || 'AAYUP-EMP-001',
        avatar: (u.fullName || r.employeeName || 'RV').substring(0, 2).toUpperCase(),
        department: u.department || r.department || 'Engineering',
        category: r.category || 'Travel',
        title: r.title || r.category || 'Claim',
        amount: Number(r.amount || 0),
        date: r.date || '02 Nov 2026',
        status: statusStr,
        receiptUrl: r.receiptUrl || r.billUrl || '',
        remarks: r.remarks || r.description || 'No description provided.',
        rejectionReason: r.rejectionReason || ''
      };
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(f =>
        f.employeeName.toLowerCase().includes(q) ||
        f.claimId.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }

    const allClaims = await Reimbursement.find({}).catch(() => []);
    const pendingTotal = allClaims.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + (c.amount || 0), 0);
    const approvedTotal = allClaims.filter(c => c.status === 'APPROVED').reduce((acc, c) => acc + (c.amount || 0), 0);
    const rejectedTotal = allClaims.filter(c => c.status === 'REJECTED').reduce((acc, c) => acc + (c.amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: formatted,
      metrics: {
        totalClaims: allClaims.length,
        pendingCount: allClaims.filter(c => c.status === 'PENDING').length,
        approvedCount: allClaims.filter(c => c.status === 'APPROVED').length,
        rejectedCount: allClaims.filter(c => c.status === 'REJECTED').length,
        pendingAmount: pendingTotal,
        approvedAmount: approvedTotal,
      }
    });
  } catch (error) {
    console.error('Error fetching reimbursements:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve claims' });
  }
};

/**
 * PATCH /api/reimbursements/:id/approve
 */
exports.approveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    await Reimbursement.findByIdAndUpdate(id, { status: 'APPROVED' }).catch(() => { });
    return res.status(200).json({ success: true, message: 'Reimbursement claim approved! Settled in next payroll cycle.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to approve claim' });
  }
};

/**
 * PATCH /api/reimbursements/:id/reject
 */
exports.rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Bill receipt mismatch / Inadmissible policy item' } = req.body;
    await Reimbursement.findByIdAndUpdate(id, { status: 'REJECTED', rejectionReason: reason }).catch(() => { });
    return res.status(200).json({ success: true, message: 'Claim rejected with employee remarks.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject claim' });
  }
};
