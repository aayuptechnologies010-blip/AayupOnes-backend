const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const Reimbursement = require('../models/Reimbursement');

async function auditPhase4() {
  await connectDB();
  
  // 1. Audit Payslips
  const payslips = await Payslip.find({});
  console.log('=== PHASE 4: PAYROLL, PAYSLIPS & REIMBURSEMENTS AUDIT ===');
  console.log('Total Generated Payslips in MongoDB:', payslips.length);
  
  payslips.forEach((p, i) => {
    console.log(`\n[Payslip ${i + 1}] Employee: ${p.employeeName} (${p.employeeId})`);
    console.log(`    Month: ${p.month} | Gross: ₹ ${p.grossSalary} | Deductions: ₹ ${p.totalDeductions} | Net: ₹ ${p.netSalary}`);
    console.log(`    Status: ${p.status}`);
  });

  // 2. Audit Reimbursements
  const claims = await Reimbursement.find({});
  console.log('\n--- Real Reimbursement Claims in MongoDB: ' + claims.length + ' ---');
  claims.forEach((c, i) => {
    console.log(`[Claim ${i + 1}] ID: ${c.claimId || c._id} | Emp: ${c.employeeName} | Amount: ₹ ${c.amount} | Cat: ${c.category} | Status: ${c.status}`);
  });

  process.exit(0);
}

auditPhase4();

