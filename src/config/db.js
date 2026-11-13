const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'mock_database.json');

// Initial seed data for production HRMS operations
const initialData = {
  users: [
    {
      id: "usr_admin_01",
      employeeId: "AAYUP-ADM-2026-0001",
      name: "Saurabh Sharma",
      email: "admin@aayuptechnologies.com",
      passwordHash: "$2a$10$wT5fN2m0j5F5xZ1J7l1iE.2gq2L5j5v5s5e5c5r5e5t5k5e5y5h5a", // admin123
      role: "admin",
      designation: "Head of Operations & IT",
      department: "Management",
      joiningDate: "01/10/2025",
      status: "ACTIVE",
      avatarInitials: "SS",
      phone: "+91 98765 43210"
    },
    {
      id: "usr_emp_02",
      employeeId: "AAYUP-EMP-2026-37583",
      name: "",
      email: "rahul.verma@aayuptechnologies.com",
      passwordHash: "$2a$10$wT5fN2m0j5F5xZ1J7l1iE.2gq2L5j5v5s5e5c5r5e5t5k5e5y5h5a", // rahul123
      role: "employee",
      designation: "Associate Software Engineer",
      department: "Core Engineering",
      joiningDate: "02/11/2026",
      status: "ACTIVE",
      avatarInitials: "RV",
      phone: "+91 91234 56780",
      shift: "24/7 Unrestricted",
      isOnDuty: true,
      lastPunchTime: "09:27:10 AM"
    }
  ],
  attendance: [
    {
      id: "att_001",
      userId: "usr_emp_02",
      date: "2026-11-03",
      punchIn: "09:00:15 AM",
      punchOut: null,
      status: "PRESENT",
      workMode: "Office",
      location: {
        latitude: 28.5355,
        longitude: 77.3910,
        address: "Noida Sector 62 Office"
      }
    }
  ],
  leaves: [
    {
      id: "lv_001",
      userId: "usr_emp_02",
      userName: "",
      leaveType: "Casual Leave (CL)",
      fromDate: "2026-11-10",
      toDate: "2026-11-10",
      session: "Full Day",
      days: 1.0,
      reason: "Family event / Personal work",
      status: "PENDING",
      appliedOn: "2026-11-02"
    }
  ],
  documents: [
    {
      id: "doc_01",
      userId: "usr_emp_02",
      type: "my_document",
      profileMode: "Fresher",
      category: "Identity Proof",
      title: "Aadhaar Card (Front & Back)",
      fileName: "aadhaar_card_verified.pdf",
      uploadDate: "02 Nov 2026",
      status: "VERIFIED",
      allowDownload: false
    },
    {
      id: "doc_02",
      userId: "usr_emp_02",
      type: "my_document",
      profileMode: "Fresher",
      category: "Tax & Identity",
      title: "PAN Card",
      fileName: "pan_card_official.pdf",
      uploadDate: "02 Nov 2026",
      status: "VERIFIED",
      allowDownload: false
    },
    {
      id: "doc_03",
      userId: "usr_emp_02",
      type: "company_document",
      category: "Employment Offer",
      title: "Official Offer Letter",
      fileName: "AayupOnes_Offer_Letter_Signed.pdf",
      uploadDate: "01 Nov 2026",
      status: "ISSUED",
      allowDownload: true
    },
    {
      id: "doc_04",
      userId: "usr_emp_02",
      type: "company_document",
      category: "Monthly Salary Slip",
      title: "October 2026 Payslip",
      fileName: "Payslip_Oct_2026.pdf",
      uploadDate: "31 Oct 2026",
      status: "GENERATED",
      allowDownload: true
    }
  ],
  holidays: [
    { id: "h1", name: "Diwali", date: "2026-11-08", day: "Sunday", type: "National" },
    { id: "h2", name: "Govardhan Puja", date: "2026-11-09", day: "Monday", type: "Regional" },
    { id: "h3", name: "Guru Nanak Jayanti", date: "2026-11-24", day: "Tuesday", type: "National" },
    { id: "h4", name: "Christmas", date: "2026-12-25", day: "Friday", type: "National" }
  ]
};

function readDb() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
}

function writeDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb };

