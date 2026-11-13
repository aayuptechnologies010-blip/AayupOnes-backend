const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const Document = require('../models/Document');
const User = require('../models/User');

async function seedCorporateDocs() {
  await connectDB();
  const admin = await User.findOne({ role: 'admin' });
  const adminId = admin ? admin._id : '000000000000000000000001';
  const adminEmpId = admin ? admin.employeeId : 'AAYUP-ADM-0001';

  const count = await Document.countDocuments({ type: 'company_document' });
  if (count === 0) {
    const docs = [
      {
        userId: adminId,
        employeeId: adminEmpId,
        type: 'company_document',
        category: 'HR Policy',
        title: 'AayupOnes Technologies Code of Conduct & Ethics Policy 2026',
        fileName: 'code_of_conduct_2026.pdf',
        fileUrl: '/uploads/code_of_conduct_2026.pdf',
        status: 'APPROVED',
        allowDownload: true
      },
      {
        userId: adminId,
        employeeId: adminEmpId,
        type: 'company_document',
        category: 'Compliance',
        title: 'POSH Policy & Internal Complaints Committee Redressal Framework',
        fileName: 'posh_policy.pdf',
        fileUrl: '/uploads/posh_policy.pdf',
        status: 'APPROVED',
        allowDownload: true
      },
      {
        userId: adminId,
        employeeId: adminEmpId,
        type: 'company_document',
        category: 'Operations',
        title: 'Leave Policy & Attendance Regularization Rules v3.0',
        fileName: 'leave_policy_v3.pdf',
        fileUrl: '/uploads/leave_policy_v3.pdf',
        status: 'APPROVED',
        allowDownload: true
      },
      {
        userId: adminId,
        employeeId: adminEmpId,
        type: 'company_document',
        category: 'Security',
        title: 'Remote Work From Home (WFH) & InfoSec Protocol',
        fileName: 'wfh_infosec_protocol.pdf',
        fileUrl: '/uploads/wfh_infosec_protocol.pdf',
        status: 'APPROVED',
        allowDownload: true
      }
    ];
    await Document.insertMany(docs);
    console.log('Seeded 4 corporate policies into MongoDB.');
  }
  process.exit(0);
}

seedCorporateDocs();
