const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');

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
        pan: u.panNumber || 'ABCDE1234F'
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
