require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require("./routes/departmentRoutes");
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require("./routes/activityRoutes");
const { protect, authorize } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
res.send('TechFlow ERP Backend is running!');
});

app.get('/api/health', (req, res) => {
res.json({
success: true,
message: 'TechFlow ERP backend is working',
});
});


app.get('/api/db-status', (req, res) => {
res.json({
success: true,
database:
mongoose.connection.readyState === 1
? 'MongoDB Atlas connected'
: 'MongoDB not connected',
});
});


app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);

app.use('/api/projects', protect, projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.get('/api/tasks-debug', (req, res) => {
  res.json({ message: "Server route is working" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
try {
await mongoose.connect(process.env.MONGODB_URI);

console.log('MongoDB Atlas connected successfully!');

app.listen(PORT, () => {
  console.log(`TechFlow ERP server running on port ${PORT}`);
});


} catch (error) {
console.error('MongoDB connection failed:', error.message);
process.exit(1);
}
}

startServer();
