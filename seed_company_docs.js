const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/aayupones_hrms');
  const emp = await mongoose.connection.db.collection('employees').findOne({ employeeId: 'AAYUP-EMP-2026-6359' });
  const Document = require('./src/models/Document');

  await Document.updateMany({ employeeId: 'AAYUP-EMP-2026-6359' }, { $set: { userId: emp._id, type: 'my_document', allowDownload: false } });

  await Document.deleteMany({ type: 'company_document' });
  const companyDocs = [
    {
      userId: emp._id,
      employeeId: 'AAYUP-EMP-2026-6359',
      type: 'company_document',
      profileMode: 'All',
      title: 'Official Offer Letter',
      category: 'Employment Offer',
      fileName: 'AayupOnes_Offer_Letter_MayankPandey.pdf',
      status: 'ISSUED',
      uploadDate: 'Issued on 05 Nov 2026',
      allowDownload: true
    },
    {
      userId: emp._id,
      employeeId: 'AAYUP-EMP-2026-6359',
      type: 'company_document',
      profileMode: 'All',
      title: 'October 2026 Payslip',
      category: 'Monthly Salary Slip',
      fileName: 'Payslip_October_2026_Mayank.pdf',
      status: 'GENERATED',
      uploadDate: 'Issued on 31 Oct 2026',
      allowDownload: true
    },
    {
      userId: emp._id,
      employeeId: 'AAYUP-EMP-2026-6359',
      type: 'company_document',
      profileMode: 'All',
      title: 'Non-Disclosure Agreement (NDA)',
      category: 'Legal & Security',
      fileName: 'AayupOnes_Corporate_NDA.pdf',
      status: 'EXECUTED',
      uploadDate: 'Signed on 05 Nov 2026',
      allowDownload: true
    },
    {
      userId: emp._id,
      employeeId: 'AAYUP-EMP-2026-6359',
      type: 'company_document',
      profileMode: 'All',
      title: 'Corporate IT & Security Policy',
      category: 'Compliance',
      fileName: 'IT_Policy_Guidelines_2026.pdf',
      status: 'ACTIVE',
      uploadDate: 'Updated 2026',
      allowDownload: true
    },
    {
      userId: emp._id,
      employeeId: 'AAYUP-EMP-2026-6359',
      type: 'company_document',
      profileMode: 'All',
      title: 'Employee Identity Certificate',
      category: 'Service Certificate',
      fileName: 'Emp_Bonafide_Certificate.pdf',
      status: 'ISSUED',
      uploadDate: 'Issued on 05 Nov 2026',
      allowDownload: true
    }
  ];

  await Document.insertMany(companyDocs);
  console.log('COMPANY_DOCS_SUCCESSFULLY_INSERTED');
  process.exit(0);
}
run();
