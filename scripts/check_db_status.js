const mongoose = require('mongoose');

async function checkDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/aayupones_hrms');
    const tasks = await mongoose.connection.collection('tasks').find().toArray();
    console.log('Tasks in DB count:', tasks.length);
    if (tasks.length > 0) {
      console.log('Tasks sample:', tasks[0]);
    }
    const employees = await mongoose.connection.collection('employees').find({}, {
      projection: { employeeId: 1, fullName: 1, email: 1, onboardingStatus: 1, onboardingProgress: 1, dob: 1, dobDay: 1, dobMonth: 1 }
    }).toArray();
    console.log('Employees in DB count:', employees.length);
    console.log('Employees:', JSON.stringify(employees, null, 2));

    const leaves = await mongoose.connection.collection('leaves').find().toArray();
    console.log('Leaves count in DB:', leaves.length);

    const attendances = await mongoose.connection.collection('attendances').find().toArray();
    console.log('Attendances count in DB:', attendances.length);

    const tickets = await mongoose.connection.collection('tickets').find().toArray();
    console.log('Tickets count in DB:', tickets.length);

    const holidays = await mongoose.connection.collection('holidays').find().toArray();
    console.log('Holidays count in DB:', holidays.length);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDB();
