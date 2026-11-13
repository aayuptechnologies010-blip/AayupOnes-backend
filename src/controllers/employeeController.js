const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Document = require('../models/Document');

/**
 * 1. GET All Employees (with Search, Filter, Pagination)
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const { search = '', dept = 'All', status = 'All', page = 1, limit = 50 } = req.query;

    let query = {};

    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { designation: { $regex: q, $options: 'i' } },
      ];
    }

    if (dept !== 'All') {
      query.department = dept;
    }

    if (status !== 'All') {
      query.onboardingStatus = status;
    }

    let employees = [];
    let totalCount = 0;

    totalCount = await Employee.countDocuments(query);
    employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Map to frontend friendly fields
    const formatted = employees.map(u => ({
      id: u.employeeId || u.id,
      mongoId: u._id ? u._id.toString() : u.id,
      name: u.name,
      role: u.designation || 'Team Member',
      dept: u.department || 'Engineering',
      type: u.employmentType || 'Full Time',
      status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
      onboardingStatus: u.onboardingStatus || 'Submitted',
      onboardingProgress: u.onboardingProgress || 70,
      avatar: u.avatarInitials || (u.name ? u.name.substring(0, 2).toUpperCase() : 'EM'),
      email: u.email,
      phone: u.phone || '+91 98000 00000',
      joined: u.joiningDate || '02 Nov 2026',
      manager: u.manager || 'Aayup Admin (HR Head)',
      salary: u.salary || '₹ 7,50,000',
      location: u.location || 'Lucknow Office',
      onboardingToken: u.onboardingToken || `onb_${u.employeeId?.toLowerCase() || 'token'}`
    }));

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / limit) || 1,
      employees: formatted,
      counts: {
        total: totalCount,
        active: formatted.filter(e => e.status === 'Active').length,
        underReview: formatted.filter(e => e.onboardingStatus === 'Under Review' || e.onboardingStatus === 'Submitted').length,
        correctionRequired: formatted.filter(e => e.onboardingStatus === 'Correction Required').length,
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee directory.' });
  }
};

/**
 * 2. GET Single Employee Details (View Inside / Dossier / Documents)
 */
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const identifier = id.trim();

    const user = await Employee.findOne({
      $or: [
        { employeeId: identifier.toUpperCase() },
        { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    // Fetch official documents for this employee from MongoDB
    let docs = [];
    try {
      docs = await Document.find({
        $or: [{ employeeId: user.employeeId }, { userId: user._id }]
      }).sort({ createdAt: -1 });
    } catch (e) {
      console.warn('Document query notice:', e.message);
    }

    const formattedDocs = (docs || []).map(d => ({
      id: d._id ? d._id.toString() : d.id,
      title: d.title,
      category: d.category,
      filename: d.fileName || d.filename || 'Document.pdf',
      size: d.size || '1.2 MB',
      uploadDate: d.uploadDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Nov 2026'),
      status: d.status || 'Verified',
      type: (d.fileName || '').endsWith('.jpg') || (d.fileName || '').endsWith('.png') ? 'image' : 'pdf',
      fileUrl: d.fileUrl || ''
    }));

    // Fetch live attendance punches for this employee from MongoDB
    let attendanceLogs = [];
    try {
      const Attendance = require('../models/Attendance');
      attendanceLogs = await Attendance.find({
        $or: [{ employeeId: user.employeeId }, { userId: user._id }]
      }).sort({ date: -1 }).limit(30);
    } catch (e) {
      console.warn('Attendance query notice:', e.message);
    }

    const formattedAttendance = (attendanceLogs || []).map(a => ({
      id: a._id ? a._id.toString() : a.id,
      date: a.date,
      in: a.punchIn || '--:--',
      out: a.punchOut || '--:--',
      hrs: a.totalHours ? `${a.totalHours} hrs` : (a.punchOut ? '8h 30m' : '--'),
      status: a.status || 'Present',
      src: a.workMode ? `Work Mode: ${a.workMode}` : 'AayupOnes App'
    }));

    // Fetch leaves for this employee from MongoDB
    let leavesList = [];
    try {
      const Leave = require('../models/Leave');
      leavesList = await Leave.find({
        $or: [{ employeeId: user.employeeId }, { userId: user._id }]
      }).sort({ createdAt: -1 });
    } catch (e) {
      console.warn('Leave query notice:', e.message);
    }

    const clConsumed = leavesList.filter(l => l.status === 'APPROVED' && (l.leaveType || '').includes('Casual')).reduce((sum, l) => sum + (l.days || 1), 0);
    const slConsumed = leavesList.filter(l => l.status === 'APPROVED' && (l.leaveType || '').includes('Sick')).reduce((sum, l) => sum + (l.days || 1), 0);
    const wfhDays = leavesList.filter(l => l.status === 'APPROVED' && (l.leaveType || '').includes('WFH')).reduce((sum, l) => sum + (l.days || 1), 0);

    // Fetch payroll & payslip records for this employee
    let latestPayslip = null;
    try {
      const Payslip = require('../models/Payslip');
      latestPayslip = await Payslip.findOne({
        $or: [{ employeeId: user.employeeId }, { userId: user._id }]
      }).sort({ createdAt: -1 });
    } catch (e) {
      console.warn('Payslip query notice:', e.message);
    }

    // Dynamic CTC computation based on user.salary
    const rawSalaryNum = parseInt((user.salary || '0').replace(/[^0-9]/g, ''), 10) || 750000;
    const monthlyGross = Math.round(rawSalaryNum / 12);
    const basicPay = latestPayslip?.basicPay || Math.round(monthlyGross * 0.50);
    const hraPay = latestPayslip?.hra || Math.round(basicPay * 0.40);
    const specialAllowance = latestPayslip?.specialAllowance || Math.max(0, monthlyGross - (basicPay + hraPay));
    const grossEarnings = basicPay + hraPay + specialAllowance;

    const pfDeduction = latestPayslip?.pf || Math.round(basicPay * 0.12);
    const ptDeduction = latestPayslip?.professionalTax || 200;
    const tdsDeduction = latestPayslip?.tds || Math.round(monthlyGross * 0.05);
    const totalDeductions = pfDeduction + ptDeduction + tdsDeduction;
    const netSalary = Math.max(0, grossEarnings - totalDeductions);

    // Activity & Audit Trail
    const auditLogs = [
      {
        time: user.updatedAt ? new Date(user.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today 10:00 AM',
        event: `Employee Status: ${user.onboardingStatus || 'Under Review'}`,
        detail: `Dossier status currently marked as ${user.onboardingStatus || 'Under Review'} with ${user.onboardingProgress || 0}% progress.`
      },
      {
        time: user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '01 Nov 2026',
        event: 'Employee Record Created',
        detail: `Assigned ID ${user.employeeId} to ${user.name} in department ${user.department}.`
      }
    ];

    if (user.onboardingDossier?.submittedAt) {
      auditLogs.splice(1, 0, {
        time: new Date(user.onboardingDossier.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date(user.onboardingDossier.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        event: 'Onboarding Application Submitted by Employee',
        detail: `Digital onboarding form submitted online with employee signature.`
      });
    }

    return res.status(200).json({
      success: true,
      employee: {
        id: user.employeeId,
        mongoId: user._id ? user._id.toString() : user.id,
        name: user.name,
        role: user.designation || 'Team Member',
        dept: user.department || 'Engineering',
        type: user.employmentType || 'Full Time',
        status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
        onboardingStatus: user.onboardingStatus || 'Under Review',
        onboardingProgress: user.onboardingProgress || 0,
        avatar: user.avatarInitials || (user.name ? user.name.substring(0, 2).toUpperCase() : 'EM'),
        email: user.email,
        phone: user.phone || '',
        joined: user.joiningDate || '',
        manager: user.manager || '',
        salary: user.salary || '₹ 0',
        location: user.location || 'Headquarters',
        shift: user.shift || 'General Shift',
        onboardingToken: user.onboardingToken || `onb_${user.employeeId.toLowerCase()}`,
        dossier: user.onboardingDossier || {}
      },
      documents: formattedDocs,
      attendance: formattedAttendance,
      leaves: {
        clTotal: 12,
        clConsumed,
        slTotal: 6,
        slConsumed,
        wfhDays,
        history: (leavesList || []).map(l => ({
          id: l._id ? l._id.toString() : l.id,
          type: l.leaveType,
          from: l.fromDate,
          to: l.toDate,
          days: l.days,
          reason: l.reason,
          status: l.status
        }))
      },
      salaryBreakdown: {
        annualCTC: rawSalaryNum,
        monthlyGross,
        basic: basicPay,
        hra: hraPay,
        special: specialAllowance,
        gross: grossEarnings,
        pf: pfDeduction,
        pt: ptDeduction,
        tds: tdsDeduction,
        deductions: totalDeductions,
        net: netSalary
      },
      auditLogs: auditLogs
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * 3. POST Create New Employee (Quick Form + Generated ID + Token)
 */
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, role, dept, phone, salary, shift, initialPassword } = req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, corporate email and designation role are mandatory.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `AAYUP-EMP-${new Date().getFullYear()}-${uniqueNum}`;
    const generatedToken = `onb_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const rawPass = initialPassword || `Welcome@${uniqueNum}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPass, salt);

    const empData = {
      employeeId: generatedId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: passwordHash,
      role: 'employee',
      designation: role.trim(),
      department: dept || 'Engineering',
      employmentType: 'Full Time',
      salary: salary || '₹ 7,50,000',
      location: 'Lucknow Office',
      joiningDate: formattedDate,
      status: 'ACTIVE',
      onboardingStatus: 'Not Started',
      onboardingProgress: 10,
      onboardingToken: generatedToken,
      avatarInitials: name.trim().substring(0, 2).toUpperCase(),
      phone: phone ? phone.trim() : '+91 98000 00000',
      shift: shift || 'General Shift (09:30 AM - 06:30 PM)',
      manager: 'Aayup Admin (HR Head)',
      isOnDuty: true,
      lastPunchTime: '09:00:00 AM'
    };

    const newEmp = await Employee.create(empData);

    return res.status(201).json({
      success: true,
      message: `Employee ${name} registered successfully! ID: ${generatedId}`,
      employee: {
        id: generatedId,
        mongoId: newEmp ? newEmp._id.toString() : generatedId,
        name: empData.name,
        email: empData.email,
        role: empData.designation,
        dept: empData.department,
        joined: empData.joiningDate,
        initialPassword: rawPass,
        onboardingToken: generatedToken,
        magicLink: `/onboard/${generatedToken}`
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).json({ success: false, message: 'Failed to create employee.' });
  }
};

/**
 * 4. POST Reset Password (Admin Action with Validation)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide and confirm the new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const user = await Employee.findOneAndUpdate(
      { $or: [{ employeeId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { passwordHash: passwordHash },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Target employee not found for password reset.' });
    }

    return res.status(200).json({
      success: true,
      message: `Password successfully updated and secured for employee ID: ${id}.`
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset employee password.' });
  }
};

/**
 * 5. DELETE Deactivate / Archive Employee
 */
exports.deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const u = await Employee.findOneAndDelete({
      $or: [
        { employeeId: id.toUpperCase() },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }
      ]
    });

    if (!u) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Employee ${u.name || id} has been permanently removed from the system.`
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({ success: false, message: 'Error deleting employee.' });
  }
};

/**
 * 6. PATCH Update Verification Status (Section Review / Dossier)
 */
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, verified, remarks, overallStatus } = req.body;

    let user = null;
    try {
      user = await Employee.findOne({
        $or: [{ employeeId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });

      if (user) {
        if (section && user.onboardingDossier && user.onboardingDossier[section]) {
          user.onboardingDossier[section].verified = verified;
          if (remarks !== undefined) user.onboardingDossier[section].remarks = remarks;
        }
        if (overallStatus) {
          user.onboardingStatus = overallStatus;
        }
        await user.save();
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Verification status updated for section "${section || 'overall'}".`,
      status: overallStatus || 'Verified'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update verification state.' });
  }
};

/**
 * 7. POST Public/Employee Onboarding Submission
 * Updates DOB, parses dobDay and dobMonth, and sets onboardingStatus to 'Submitted'
 */
exports.submitOnboarding = async (req, res) => {
  try {
    const { token } = req.params;
    const formData = req.body;

    const emp = await Employee.findOne({
      $or: [
        { onboardingToken: token },
        { employeeId: token.toUpperCase() },
        { _id: token.match(/^[0-9a-fA-F]{24}$/) ? token : null }
      ]
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Invalid onboarding link or token expired.' });
    }

    // Save DOB and calculate day & month
    if (formData.dob) {
      emp.dob = formData.dob.trim();
      // Handle YYYY-MM-DD or DD/MM/YYYY
      if (emp.dob.includes('-')) {
        const parts = emp.dob.split('-');
        if (parts.length === 3) {
          emp.dobDay = parseInt(parts[2], 10);
          emp.dobMonth = parseInt(parts[1], 10);
        }
      } else if (emp.dob.includes('/')) {
        const parts = emp.dob.split('/');
        if (parts.length === 3) {
          emp.dobDay = parseInt(parts[0], 10);
          emp.dobMonth = parseInt(parts[1], 10);
        }
      }
    }

    if (formData.fullName) {
      emp.name = formData.fullName.trim();
      emp.avatarInitials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (formData.mobileNumber) emp.phone = formData.mobileNumber.trim();
    if (formData.profilePic) emp.profilePic = formData.profilePic;
    emp.onboardingStatus = 'Submitted';
    emp.onboardingProgress = 100;
    emp.onboardingDossier = {
      ...(emp.onboardingDossier || {}),
      submittedData: formData,
      submittedAt: new Date().toISOString()
    };

    await emp.save();

    return res.status(200).json({
      success: true,
      message: 'Onboarding application successfully submitted and queued for HR verification!',
      employee: {
        id: emp.employeeId,
        name: emp.name,
        dob: emp.dob,
        dobDay: emp.dobDay,
        dobMonth: emp.dobMonth,
        avatarInitials: emp.avatarInitials,
        profilePic: emp.profilePic,
        onboardingStatus: emp.onboardingStatus,
        onboardingProgress: emp.onboardingProgress
      }
    });
  } catch (error) {
    console.error('Error submitting onboarding dossier:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit onboarding form.' });
  }
};

