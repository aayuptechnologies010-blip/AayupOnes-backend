const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/aayupones_hrms');
  
  // Set AAYUP-EMP-2026-6359 as primary employee
  await mongoose.connection.db.collection('employees').deleteMany({});

  const sampleDossierData = {
    fullName: 'Mayank Pandey',
    fatherName: 'Ramesh Pandey',
    motherName: 'Sunita Pandey',
    dob: '2000-11-05',
    gender: 'Male',
    maritalStatus: 'Single',
    bloodGroup: 'B+',
    mobileNumber: '+919988776655',
    personalEmail: 'mayank@gmail.com',
    currentAddress: 'Sector 4, Gomti Nagar, Lucknow',
    permanentAddress: 'Sector 4, Gomti Nagar, Lucknow',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    pinCode: '226010',
    highestQualification: 'B.Tech Computer Science',
    courseName: 'Computer Science & Engineering',
    universityName: 'AKTU Lucknow',
    passingYear: '2023',
    percentageCGPA: '8.4 CGPA',
    bankName: 'HDFC Bank',
    accountHolderName: 'Mayank Pandey',
    accountNumber: '501004589234',
    ifscCode: 'HDFC0001234',
    branchName: 'Gomti Nagar Branch',
    accountType: 'Savings',
    aadhaarNumber: '458978129034',
    panNumber: 'ABCDE1234F',
    uanNumber: '100984561234',
    nomineeName: 'Ramesh Pandey',
    nomineeRelation: 'Father'
  };

  const emp6359 = {
    employeeId: 'AAYUP-EMP-2026-6359',
    name: 'Mayank Pandey',
    email: 'mayank@gmail.com',
    passwordHash: '$2a$10$QJ3QeGlsN9DVdzM4AH2j3e./LVh0Q4pL807P55qT7hLHSV/qqHfEe',
    role: 'employee',
    designation: 'mern developer',
    department: 'Engineering',
    employmentType: 'Full Time',
    salary: '₹ 7,50,000',
    location: 'Lucknow Office',
    joiningDate: '05 Nov 2026',
    dob: '2000-11-05',
    dobDay: 5,
    dobMonth: 11,
    status: 'ACTIVE',
    onboardingStatus: 'Submitted',
    onboardingProgress: 100,
    avatarInitials: 'MA',
    phone: '+919988776655',
    shift: 'General Shift (09:30 AM - 06:30 PM)',
    manager: 'Aayup Admin (HR Head)',
    isOnDuty: true,
    lastPunchTime: '09:00:00 AM',
    onboardingDossier: {
      submittedAt: new Date('2026-11-05T01:25:00Z'),
      submittedData: sampleDossierData
    },
    createdAt: new Date('2026-11-05T00:48:00Z'),
    updatedAt: new Date('2026-11-05T02:02:00Z')
  };

  await mongoose.connection.db.collection('employees').insertOne(emp6359);

  const sampleDocs = [
    { title: 'Aadhaar Card Front & Back', category: 'Identity Proof', fileName: 'aadhaar_card_mayank.pdf', size: '1.4 MB', status: 'Verified' },
    { title: 'PAN Card Copy', category: 'Government Tax ID', fileName: 'pan_card_mayank.pdf', size: '850 KB', status: 'Verified' },
    { title: 'B.Tech Degree Marksheet', category: 'Academic Certificate', fileName: 'degree_certificate.pdf', size: '2.1 MB', status: 'Verified' },
    { title: 'Cancelled Cheque / Passbook', category: 'Banking Proof', fileName: 'bank_cheque.pdf', size: '920 KB', status: 'Verified' }
  ];

  await mongoose.connection.db.collection('documents').deleteMany({});
  for (let d of sampleDocs) {
    await mongoose.connection.db.collection('documents').insertOne({
      ...d,
      employeeId: 'AAYUP-EMP-2026-6359',
      createdAt: new Date()
    });
  }

  await mongoose.connection.db.collection('attendances').deleteMany({});
  await mongoose.connection.db.collection('attendances').insertOne({
    employeeId: 'AAYUP-EMP-2026-6359',
    date: '05 Nov 2026',
    punchIn: '09:30 AM',
    punchOut: '06:30 PM',
    totalHours: 9,
    status: 'Present',
    workMode: 'Office',
    createdAt: new Date()
  });

  console.log('SUCCESS_SYNCED_AAYUP_EMP_2026_6359');
  process.exit(0);
}
run();
