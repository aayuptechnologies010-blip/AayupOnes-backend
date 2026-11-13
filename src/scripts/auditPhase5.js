const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const Ticket = require('../models/Ticket');
const Document = require('../models/Document');

async function auditPhase5() {
  await connectDB();
  
  // 1. Audit Helpdesk Tickets
  const tickets = await Ticket.find({});
  console.log('=== PHASE 5: HELPDESK & DOCUMENTS AUDIT ===');
  console.log('Total Helpdesk Tickets in MongoDB:', tickets.length);
  
  tickets.forEach((t, i) => {
    console.log(`\n[Ticket ${i + 1}] ID: ${t.ticketId || t._id} | Priority: ${t.priority} | Status: ${t.status}`);
    console.log(`    Category: ${t.category} | Subject: ${t.subject}`);
    console.log(`    Assigned To: ${t.assignedTo}`);
  });

  // 2. Audit Policy Documents
  const docs = await Document.find({});
  console.log('\n--- Corporate Policy Documents in MongoDB: ' + docs.length + ' ---');
  docs.forEach((d, i) => {
    console.log(`[Doc ${i + 1}] Title: ${d.title} | Cat: ${d.category} | Dept: ${d.department} | Mandatory: ${d.isMandatory}`);
  });

  process.exit(0);
}

auditPhase5();

