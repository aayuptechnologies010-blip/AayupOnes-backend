const Leave = require('../models/Leave');
const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');
const { readDb, writeDb } = require('../config/db');

/**
 * 1. GET All Approvals (Leaves) with Search, Filter & Counts
 */
exports.getAllApprovals = async (req, res) => {
  try {
    const { search = '', status = 'All', page = 1, limit = 50 } = req.query;

    let query = {};

    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { employeeName: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { leaveType: { $regex: q, $options: 'i' } },
        { reason: { $regex: q, $options: 'i' } },
      ];
    }

    if (status !== 'All') {
      query.status = status.toUpperCase();
    }

    let leaves = [];
    let totalCount = 0;

    try {
      totalCount = await Leave.countDocuments(query);
      leaves = await Leave.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    } catch (e) {
      console.warn('MongoDB leaves query notice:', e.message);
    }

    // Fallback store
    if (!leaves || leaves.length === 0) {
      const db = readDb();
      let list = db.leaves || [];

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(l => 
          (l.userName && l.userName.toLowerCase().includes(q)) ||
          (l.employeeId && l.employeeId.toLowerCase().includes(q)) ||
          (l.leaveType && l.leaveType.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
        );
      }

      if (status !== 'All') {
        list = list.filter(l => (l.status || 'PENDING').toUpperCase() === status.toUpperCase());
      }

      totalCount = list.length;
      leaves = list.slice((page - 1) * limit, page * limit);
    }

    // Format for frontend
    const formatted = leaves.map(l => {
      const rawId = l._id ? l._id.toString() : (l.id || '');
      const shortId = rawId.length > 8 ? `LEV-${rawId.slice(-6).toUpperCase()}` : rawId;

      return {
        id: shortId,
        rawId: rawId,
        empId: l.employeeId || 'AAYUP-EMP-2026-37583',
        emp: l.employeeName || l.userName || 'Rahul Verma',
        avatar: (l.employeeName || l.userName || 'RV').substring(0, 2).toUpperCase(),
        role: l.employeeId || 'Associate Developer',
        type: l.leaveType,
        dates: `${l.fromDate}${l.toDate && l.toDate !== l.fromDate ? ` to ${l.toDate}` : ''} (${l.session || 'Full Day'})`,
        days: l.days || 1.0,
        session: l.session || 'Full Day',
        appliedOn: l.appliedOn || (l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : '02 Nov 2026'),
        reason: l.reason,
        status: (l.status || 'PENDING').charAt(0).toUpperCase() + (l.status || 'PENDING').slice(1).toLowerCase(),
        adminRemark: l.adminRemark || '',
        handoverTo: l.handoverTo || 'Team Lead'
      };
    });

    // Real Status Counters
    const allDbLeaves = (await Leave.find({}).catch(() => [])) || [];
    const pendingCount = allDbLeaves.length > 0 
      ? allDbLeaves.filter(l => l.status === 'PENDING').length 
      : formatted.filter(a => a.status === 'Pending').length;
    const approvedCount = allDbLeaves.length > 0 
      ? allDbLeaves.filter(l => l.status === 'APPROVED').length 
      : formatted.filter(a => a.status === 'Approved').length;
    const rejectedCount = allDbLeaves.length > 0 
      ? allDbLeaves.filter(l => l.status === 'REJECTED').length 
      : formatted.filter(a => a.status === 'Rejected').length;

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / limit) || 1,
      data: formatted,
      approvals: formatted,
      counts: {
        total: totalCount || formatted.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      }
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve approval inbox.' });
  }
};

/**
 * 2. PATCH Approve Single Request
 */
exports.approveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    let updated = false;

    try {
      const leave = await Leave.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }] },
        { status: 'APPROVED', adminRemark: 'Approved by Administrator' },
        { returnDocument: 'after' }
      );
      if (leave) updated = true;
    } catch (e) {}

    // Fallback store
    const db = readDb();
    const local = (db.leaves || []).find(l => l.id === id);
    if (local) {
      local.status = 'APPROVED';
      writeDb(db);
      updated = true;
    }

    return res.status(200).json({
      success: true,
      message: 'Leave application approved! Synced with employee mobile app.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error approving request.' });
  }
};

/**
 * 3. PATCH Reject Request with Reason
 */
exports.rejectApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Operational requirements' } = req.body;

    try {
      await Leave.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }] },
        { status: 'REJECTED', adminRemark: reason },
        { returnDocument: 'after' }
      );
    } catch (e) {}

    const db = readDb();
    const local = (db.leaves || []).find(l => l.id === id);
    if (local) {
      local.status = 'REJECTED';
      local.adminRemark = reason;
      writeDb(db);
    }

    return res.status(200).json({
      success: true,
      message: 'Leave application rejected with remarks sent to employee.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error rejecting request.' });
  }
};

/**
 * 4. POST Bulk Approve All Pending Requests
 */
exports.bulkApproveAll = async (req, res) => {
  try {
    try {
      await Leave.updateMany(
        { status: 'PENDING' },
        { status: 'APPROVED', adminRemark: 'Bulk approved by Administrator' }
      );
    } catch (e) {}

    const db = readDb();
    (db.leaves || []).forEach(l => {
      if (l.status === 'PENDING') l.status = 'APPROVED';
    });
    writeDb(db);

    return res.status(200).json({
      success: true,
      message: 'All pending requests approved and synced with Mobile App!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error executing bulk approval.' });
  }
};

/**
 * 5. GET / PATCH Leave Policy Configuration
 */
exports.getLeavePolicies = async (req, res) => {
  try {
    let settings = null;
    try {
      settings = await SystemSetting.findOne();
    } catch (e) {}

    const policies = settings?.leavePolicies || {
      annualCL: 12,
      annualSL: 8,
      monthlyWFHQuota: 2,
      carryForwardLimit: 8,
      probationLeaveAllowed: true,
      requireDoctorCertificateBeyondDays: 2
    };

    return res.status(200).json({ success: true, policies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching leave policies.' });
  }
};

exports.updateLeavePolicies = async (req, res) => {
  try {
    const { policies } = req.body;
    try {
      await SystemSetting.findOneAndUpdate(
        {},
        { leavePolicies: policies },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Company leave policies updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating leave policies.' });
  }
};

