const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');
const { connectDB } = require('./config/mongo');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Security & Parsing Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CORS configuration (Allows Admin Web and Mobile local testing)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://10.0.2.2')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during local development testing
    }
  },
  credentials: true
}));

// Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'AayupOnes Enterprise API Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🚀 AayupOnes Backend Service Live on Port ${PORT}`);
  console.log(`  🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`  📱 Auth API:        http://localhost:${PORT}/api/auth/login`);
  console.log(`=======================================================`);
});

