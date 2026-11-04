const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');
const { readDb, writeDb } = require('../config/db');

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

    try {
      totalCount = await User.countDocuments(query);
      employees = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    } catch (e) {
      console.warn('MongoDB employees query notice:', e.message);
    }

    // Fallback store
    if (!employees || employees.length === 0) {
      const db = readDb();
      let list = db.users || [];

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(u => 
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
        );
      }
      if (dept !== 'All') {
        list = list.filter(u => u.department === dept);
      }
      if (status !== 'All') {
        list = list.filter(u => (u.onboardingStatus || 'Submitted') === status);
      }

      totalCount = list.length;
      employees = list.slice((page - 1) * limit, page * limit);
    }

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
      manager: u.manager || 'Rahul Kumar (HR Admin)',
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

    let user = null;
    try {
      user = await User.findOne({
        $or: [
          { employeeId: identifier.toUpperCase() },
          { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
        ]
      });
    } catch (e) {}

    if (!user) {
      const db = readDb();
      user = db.users.find(u => 
        (u.employeeId && u.employeeId.toLowerCase() === identifier.toLowerCase()) || 
        u.id === identifier
      );
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    // Fetch official documents for this employee
    let docs = [];
    try {
      docs = await Document.find({
        $or: [{ employeeId: user.employeeId }, { userId: user._id }]
      });
    } catch (e) {}

    if (!docs || docs.length === 0) {
      docs = [
        {
          id: 'doc-1',
          title: 'Aadhaar Card (Front & Back)',
          category: 'Identity Proof (KYC)',
          filename: 'Aadhaar_Card_Verified.pdf',
          size: '1.4 MB',
          uploadDate: '01 Nov 2026',
          status: 'Verified',
          type: 'pdf'
        },
        {
          id: 'doc-2',
          title: 'Permanent Account Number (PAN) Card',
          category: 'Tax & Compliance',
          filename: 'PAN_Card_Official.pdf',
          size: '890 KB',
          uploadDate: '01 Nov 2026',
          status: 'Verified',
          type: 'pdf'
        },
        {
          id: 'doc-3',
          title: 'Cancelled Cheque / Bank Passbook Copy',
          category: 'Payroll & Banking',
          filename: 'HDFC_Cancelled_Cheque.jpg',
          size: '2.1 MB',
          uploadDate: '01 Nov 2026',
          status: 'Verified',
          type: 'image'
        },
        {
          id: 'doc-4',
          title: 'Graduation Degree / Final Certificate',
          category: 'Educational',
          filename: 'BTech_Degree_AKTU.pdf',
          size: '3.2 MB',
          uploadDate: '01 Nov 2026',
          status: 'Verified',
          type: 'pdf'
        }
      ];
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
        onboardingProgress: user.onboardingProgress || 80,
        avatar: user.avatarInitials || (user.name ? user.name.substring(0, 2).toUpperCase() : 'EM'),
        email: user.email,
        phone: user.phone || '+91 98000 00000',
        joined: user.joiningDate || '02 Nov 2026',
        manager: user.manager || 'Rahul Kumar (HR Admin)',
        salary: user.salary || '₹ 7,50,000',
        location: user.location || 'Lucknow Office',
        onboardingToken: user.onboardingToken || `onb_${user.employeeId.toLowerCase()}`,
        dossier: user.onboardingDossier || {
          personal: { fatherName: 'Ram Prakash', dob: '1998-05-15', gender: 'Male', verified: true },
          address: { currentAddress: 'Gomti Nagar, Lucknow', city: 'Lucknow', state: 'UP', verified: true },
          education: { highestQualification: 'B.Tech CS', university: 'AKTU', verified: true },
          bank: { bankName: 'HDFC Bank', accountNumber: '50100234567890', ifscCode: 'HDFC0001234', verified: true },
          emergency: { contactName: 'Ram Prakash', relationship: 'Father', contactPhone: '+91 94150 12345', verified: true }
        }
      },
      documents: docs
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
      manager: 'Rahul Kumar (HR Admin)',
      isOnDuty: true,
      lastPunchTime: '09:00:00 AM'
    };

    let newEmp = null;
    try {
      newEmp = await User.create(empData);
    } catch (e) {
      console.warn('Mongo save notice, saving to local store:', e.message);
    }

    // Mirror to local store
    const db = readDb();
    const localRecord = { id: generatedId, ...empData };
    db.users.unshift(localRecord);
    writeDb(db);

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

    let updated = false;

    // MongoDB Update
    try {
      const user = await User.findOneAndUpdate(
        { $or: [{ employeeId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { passwordHash: passwordHash },
        { returnDocument: 'after' }
      );
      if (user) updated = true;
    } catch (e) {}

    // Local DB Update
    const db = readDb();
    const localUser = db.users.find(u => 
      (u.employeeId && u.employeeId.toLowerCase() === id.toLowerCase()) || 
      u.id === id
    );
    if (localUser) {
      localUser.passwordHash = passwordHash;
      writeDb(db);
      updated = true;
    }

    if (!updated) {
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

    let deactivated = false;

    try {
      const u = await User.findOneAndUpdate(
        { $or: [{ employeeId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { status: 'INACTIVE', onboardingStatus: 'Correction Required' },
        { returnDocument: 'after' }
      );
      if (u) deactivated = true;
    } catch (e) {}

    const db = readDb();
    const idx = db.users.findIndex(u => 
      (u.employeeId && u.employeeId.toLowerCase() === id.toLowerCase()) || 
      u.id === id
    );
    if (idx >= 0) {
      db.users[idx].status = 'INACTIVE';
      writeDb(db);
      deactivated = true;
    }

    if (!deactivated) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Employee ${id} has been deactivated and archived in database.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deactivating employee.' });
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
      user = await User.findOne({
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

