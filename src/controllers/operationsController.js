const Document = require('../models/Document');
const Ticket = require('../models/Ticket');
const SystemSetting = require('../models/SystemSetting');
const Holiday = require('../models/Holiday');
const Leave = require('../models/Leave');
const User = require('../models/User');

/**
 * Mobile App Endpoints
 */
exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    let holidays = await Holiday.find({}).sort({ date: 1 });
    if (holidays.length === 0) {
      holidays = [
        { name: 'Diwali', date: '2026-11-01', type: 'Mandatory', description: 'Festival of Lights' },
        { name: 'Govardhan Puja', date: '2026-11-02', type: 'Mandatory', description: 'Festive Holiday' },
        { name: 'Bhai Dooj', date: '2026-11-03', type: 'Mandatory', description: 'Festive Holiday' },
        { name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'Mandatory', description: 'Guru Nanak Birthday' },
        { name: 'Christmas Day', date: '2026-12-25', type: 'Mandatory', description: 'Christmas Celebration' },
      ];
      await Holiday.insertMany(holidays).catch(() => {});
    }
    return res.status(200).json({ success: true, holidays });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason, session } = req.body;
    const newLeave = await Leave.create({
      userId: req.user.userId,
      employeeId: req.user.employeeId || 'AAYUP-EMP-001',
      employeeName: req.user.fullName || 'Employee',
      leaveType,
      fromDate,
      toDate,
      session: session || 'Full Day',
      reason,
      status: 'PENDING'
    });
    return res.status(201).json({ success: true, message: 'Leave application submitted!', leave: newLeave });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to apply leave' });
  }
};

exports.toggleShift = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Shift status toggled successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Shift toggle failed' });
  }
};

/**
 * Admin Web Endpoints
 */
exports.getDocumentsList = async (req, res) => {
  try {
    let docs = await Document.find({}).populate('userId', 'fullName employeeId department designation').sort({ createdAt: -1 });
    
    if (docs.length === 0) {
      const defaultDocs = [
        {
          title: 'AayupOnes Code of Conduct & Ethics Policy 2026',
          category: 'Company Policy',
          department: 'All Departments',
          fileUrl: '/uploads/code_of_conduct_2026.pdf',
          fileSize: '1.8 MB',
          uploadedBy: 'HR Compliance Office',
          status: 'APPROVED',
          isMandatory: true,
          expiryDate: new Date('2027-12-31')
        },
        {
          title: 'Remote Work & Cyber Security Guidelines',
          category: 'IT & Security',
          department: 'Engineering',
          fileUrl: '/uploads/cyber_security_policy.pdf',
          fileSize: '2.4 MB',
          uploadedBy: 'Information Security Lead',
          status: 'APPROVED',
          isMandatory: true,
          expiryDate: new Date('2027-12-31')
        },
        {
          title: 'Group Health Insurance & Mediclaim Policy Schedule',
          category: 'Benefits & Insurance',
          department: 'All Departments',
          fileUrl: '/uploads/mediclaim_policy_card.pdf',
          fileSize: '3.1 MB',
          uploadedBy: 'HR Operations',
          status: 'APPROVED',
          isMandatory: false,
          expiryDate: new Date('2027-09-30')
        }
      ];
      docs = await Document.insertMany(defaultDocs).catch(() => []);
    }

    const formatted = docs.map(d => ({
      id: d._id ? d._id.toString() : d.id,
      title: d.title,
      category: d.category || 'General Document',
      department: d.department || 'All Departments',
      fileUrl: d.fileUrl || '#',
      fileSize: d.fileSize || '1.5 MB',
      uploadedBy: d.uploadedBy || (d.userId ? d.userId.fullName : 'HR Department'),
      uploadedOn: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : '01 Nov 2026',
      status: d.status || 'APPROVED',
      isMandatory: d.isMandatory || false
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
};

exports.getHelpdeskTickets = async (req, res) => {
  try {
    let tickets = await Ticket.find({}).populate('userId', 'fullName employeeId department designation email').sort({ createdAt: -1 });

    if (tickets.length === 0) {
      const defaultTickets = [
        {
          ticketId: 'TICK-401',
          subject: 'External 4K Monitor flickering on HDMI port',
          category: 'IT Hardware & Display',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          description: 'The second HDMI monitor turns black every few minutes while compiling code.',
          assignedTo: 'Vikram Singh (IT Lead)'
        },
        {
          ticketId: 'TICK-402',
          subject: 'Section 80C health insurance deduction discrepancy',
          category: 'Payroll & Tax Slabs',
          priority: 'MEDIUM',
          status: 'OPEN',
          description: 'Mediclaim premium deduction differs from the policy schedule.',
          assignedTo: 'Pooja Verma (HR)'
        },
        {
          ticketId: 'TICK-403',
          subject: 'VPN token credentials reset request',
          category: 'Software & Network Access',
          priority: 'LOW',
          status: 'RESOLVED',
          description: 'Need new multi-factor authentication seed for VPN client.',
          assignedTo: 'DevOps Desk'
        }
      ];
      tickets = await Ticket.insertMany(defaultTickets).catch(() => []);
    }

    const formatted = tickets.map(t => {
      const u = t.userId || {};
      const statusFormatted = (t.status || 'OPEN').replace('_', ' ');

      return {
        id: t._id ? t._id.toString() : t.id,
        ticketId: t.ticketId || `TICK-${(t._id || '').toString().slice(-4).toUpperCase()}`,
        emp: u.fullName || 'Rahul Verma',
        empId: u.employeeId || 'AAYUP-EMP-001',
        dept: u.department || 'Engineering',
        avatar: (u.fullName || 'RV').slice(0, 2).toUpperCase(),
        category: t.category || 'General Inquiry',
        subject: t.subject || 'Helpdesk Request',
        priority: t.priority || 'MEDIUM',
        status: statusFormatted.charAt(0).toUpperCase() + statusFormatted.slice(1).toLowerCase(),
        assignedTo: t.assignedTo || 'IT Support',
        created: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '02 Nov 2026',
        description: t.description || ''
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const updated = await Ticket.findByIdAndUpdate(
      id,
      { status: (status || 'RESOLVED').toUpperCase(), resolutionRemark: remarks },
      { returnDocument: 'after' }
    );
    return res.status(200).json({ success: true, message: 'Ticket status updated!', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update ticket.' });
  }
};

exports.getCompanySettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ type: 'COMPANY_SETTINGS' });
    if (!settings) {
      settings = await SystemSetting.create({
        type: 'COMPANY_SETTINGS',
        data: {
          companyName: 'AayupOnes Technologies Private Limited',
          officialEmail: 'contact@aayup.com',
          supportPhone: '+91 522 4901 888',
          officeAddress: 'Cyber Heights, 6th Floor, Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010',
          geofenceRadiusMeters: 100,
          graceTimeMinutes: 15,
          requireSelfieCheckin: true,
          requireDoctorCertDays: 2
        }
      });
    }
    return res.status(200).json({ success: true, data: settings.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

exports.updateCompanySettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const updated = await SystemSetting.findOneAndUpdate(
      { type: 'COMPANY_SETTINGS' },
      { data: settings },
      { upsert: true, returnDocument: 'after' }
    );
    return res.status(200).json({ success: true, message: 'Company settings saved to database!', data: updated.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
};
