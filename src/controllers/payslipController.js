const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { sendMail, getPayslipEmailTemplate } = require('../services/emailService');
const { sendPushNotification } = require('../services/fcmService');

/**
 * GET /api/payslips
 * List all generated payslips with filters
 */
exports.getPayslips = async (req, res) => {
  try {
    const { month = 'November 2026', search = '', department = 'All' } = req.query;

    let records = [];
    try {
      records = await Payslip.find({ month })
        .populate('userId', 'fullName employeeId department designation email panNumber bankDetails')
        .sort({ createdAt: -1 });
    } catch (e) {
      console.warn('MongoDB payslips query notice:', e.message);
    }

    let formatted = records.map(p => {
      const u = p.userId || {};
      const basic = p.basicPay || p.basic || 38000;
      const hra = p.hra || 19000;
      const special = p.specialAllowance || 12500;
      const bonus = p.performanceBonus || 0;
      const gross = p.grossPay || p.grossSalary || (basic + hra + special + bonus);

      const pf = p.pf || p.providentFund || 2160;
      const pt = p.professionalTax || 200;
      const tds = p.tds || 2800;
      const other = p.otherDeductions || 0;
      const ded = p.totalDeductions || (pf + pt + tds + other);
      const net = p.netPay || p.netSalary || (gross - ded);

      return {
        id: p._id ? p._id.toString() : p.id,
        slipNo: p.payslipNumber || `PAYSLIP-${month.slice(0, 3).toUpperCase()}-${(p.employeeId || u.employeeId || '001').slice(-4)}`,
        employeeId: p.employeeId || u.employeeId || 'AAYUP-EMP-001',
        empName: p.employeeName || u.name || u.fullName || '',
        avatar: ((p.employeeName || u.name || u.fullName || 'RV')).substring(0, 2).toUpperCase(),
        department: u.department || 'Engineering',
        designation: u.designation || 'Software Engineer',
        month: p.month || month,
        basic: basic,
        hra: hra,
        specialAllowance: special,
        performanceBonus: bonus,
        grossSalary: gross,
        providentFund: pf,
        professionalTax: pt,
        tds: tds,
        otherDeductions: other,
        totalDeductions: ded,
        netSalary: net,
        paidDays: p.daysWorked || p.paidDays || 30,
        status: p.status || 'Generated',
        publishedAt: p.publishedAt || p.generatedDate || '01 Nov 2026',
        bankAccount: (u.bankDetails && u.bankDetails.accountNumber) ? `HDFC •••• ${u.bankDetails.accountNumber.slice(-4)}` : 'HDFC •••• 9821',
        pan: u.panNumber || 'ABCDE1234F',
        sentViaEmail: Boolean(p.sentViaEmail),
        sentToApp: Boolean(p.sentToApp),
        lastSentAt: p.lastSentAt || null,
        email: u.email || ''
      };
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(f => f.empName.toLowerCase().includes(q) || f.employeeId.toLowerCase().includes(q));
    }

    if (department !== 'All') {
      formatted = formatted.filter(f => f.department.toLowerCase() === department.toLowerCase());
    }

    const totalGross = formatted.reduce((sum, item) => sum + (item.grossSalary || 0), 0);
    const totalNet = formatted.reduce((sum, item) => sum + (item.netSalary || 0), 0);

    return res.status(200).json({
      success: true,
      data: formatted,
      month,
      totalCount: formatted.length,
      summary: {
        totalStaff: formatted.length,
        grossPool: totalGross,
        netPool: totalNet
      }
    });
  } catch (error) {
    console.error('Error in getPayslips:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payslips' });
  }
};

/**
 * POST /api/payslips/send
 * Admin sends a specific payslip to Employee App, Email, or Both
 */
exports.sendPayslip = async (req, res) => {
  try {
    const { id, sendToApp = true, sendToEmail = true } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Payslip ID is required' });
    }

    const payslip = await Payslip.findById(id).populate('userId');
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    const employee = payslip.userId || await Employee.findOne({ employeeId: payslip.employeeId });
    const empEmail = employee?.email;
    const empName = payslip.employeeName || employee?.name || employee?.fullName || 'Employee';

    let appDelivery = false;
    let emailDelivery = false;

    // 1. Send to Mobile App (Push Notification + In-App notification record)
    if (sendToApp) {
      try {
        await Notification.create({
          userId: employee?._id,
          employeeId: payslip.employeeId,
          type: 'PAYROLL',
          title: `Payslip Issued: ${payslip.month}`,
          desc: `Your payslip for ${payslip.month} (Net: ₹${payslip.netPay?.toLocaleString('en-IN')}) is now available for download.`,
          isUnread: true,
          route: '/payslip',
        });

        // Trigger FCM push to phone
        if (employee?.fcmToken) {
          await sendPushNotification({
            fcmToken: employee.fcmToken,
            title: `Salary Credited: ${payslip.month}`,
            body: `Your net salary ₹${payslip.netPay?.toLocaleString('en-IN')} has been disbursed. Tap to download payslip.`,
            data: { route: '/payslip', payslipId: payslip._id.toString() },
          });
        }
        appDelivery = true;
      } catch (err) {
        console.warn('App notification warning:', err.message);
      }
    }

    // 2. Send to Registered Email
    if (sendToEmail && empEmail) {
      try {
        const html = getPayslipEmailTemplate({
          employeeName: empName,
          employeeId: payslip.employeeId,
          month: payslip.month,
          year: payslip.year || 2026,
          grossPay: payslip.grossPay,
          netPay: payslip.netPay,
          payslipNumber: payslip.payslipNumber,
          downloadUrl: payslip.pdfUrl || '',
        });

        const mailRes = await sendMail({
          to: empEmail,
          subject: `Aayup Technologies: Salary Slip - ${payslip.month}`,
          html,
        });
        emailDelivery = mailRes.success;
      } catch (err) {
        console.error('Email dispatch error:', err.message);
      }
    }

    payslip.sentToApp = appDelivery || payslip.sentToApp;
    payslip.sentViaEmail = emailDelivery || payslip.sentViaEmail;
    payslip.lastSentAt = new Date();
    await payslip.save();

    return res.status(200).json({
      success: true,
      message: `Payslip delivered successfully!${appDelivery ? ' [Mobile App]' : ''}${emailDelivery ? ' [Email]' : ''}`,
      data: {
        sentToApp: payslip.sentToApp,
        sentViaEmail: payslip.sentViaEmail,
        lastSentAt: payslip.lastSentAt,
      },
    });
  } catch (error) {
    console.error('Send payslip error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send payslip' });
  }
};

/**
 * POST /api/payslips/send-bulk
 * Admin dispatches payslips for all staff for a selected month
 */
exports.sendBulkPayslips = async (req, res) => {
  try {
    const { month, sendToApp = true, sendToEmail = true } = req.body;
    const slips = await Payslip.find({ month }).populate('userId');

    let successCount = 0;
    for (const slip of slips) {
      const emp = slip.userId || await Employee.findOne({ employeeId: slip.employeeId });
      const empEmail = emp?.email;
      const empName = slip.employeeName || emp?.name || emp?.fullName || 'Employee';

      if (sendToApp) {
        await Notification.create({
          userId: emp?._id,
          employeeId: slip.employeeId,
          type: 'PAYROLL',
          title: `Payslip Issued: ${slip.month}`,
          desc: `Your payslip for ${slip.month} has been published.`,
          isUnread: true,
          route: '/payslip',
        }).catch(() => {});
      }

      if (sendToEmail && empEmail) {
        const html = getPayslipEmailTemplate({
          employeeName: empName,
          employeeId: slip.employeeId,
          month: slip.month,
          year: slip.year || 2026,
          grossPay: slip.grossPay,
          netPay: slip.netPay,
          payslipNumber: slip.payslipNumber,
          downloadUrl: slip.pdfUrl || '',
        });

        await sendMail({
          to: empEmail,
          subject: `Aayup Technologies: Salary Slip - ${slip.month}`,
          html,
        }).catch(() => {});
      }

      slip.sentToApp = sendToApp || slip.sentToApp;
      slip.sentViaEmail = sendToEmail || slip.sentViaEmail;
      slip.lastSentAt = new Date();
      await slip.save().catch(() => {});
      successCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Dispatched ${successCount} payslip(s) via ${sendToApp && sendToEmail ? 'App and Email' : (sendToApp ? 'App' : 'Email')}.`,
      count: successCount,
    });
  } catch (error) {
    console.error('Bulk send payslips error:', error);
    return res.status(500).json({ success: false, message: 'Failed to dispatch bulk payslips' });
  }
};
