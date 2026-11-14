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
const announcementRoutes = require('./routes/announcementRoutes');
const { connectDB, mongoose } = require('./config/mongo');
const { initBirthdayCron } = require('./services/birthdayScheduler');
const { initOnboardingReminderCron } = require('./services/onboardingReminderScheduler');
const { initFirebase } = require('./services/fcmService');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB & Initialize Schedulers & Firebase
connectDB().then(() => {
  initBirthdayCron();
  initOnboardingReminderCron();
  initFirebase();
});

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
const healthHandler = (req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  const mongoStates = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  res.status(200).json({
    status: 'ONLINE',
    service: 'AayupOnes Enterprise API Backend',
    database: {
      status: mongoStates[mongoose.connection.readyState] || 'UNKNOWN',
      connected: isMongoReady,
      host: mongoose.connection.host || 'Atlas Cloud',
      name: mongoose.connection.name || 'aayupones_hrms'
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

// Available at root '/' and '/api/health' and '/health'
app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

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
app.use('/api/announcements', announcementRoutes);

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

