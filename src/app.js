// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./repository/config/index'); // <-- destructure the instance
const { attachAuditHooks } = require('./repository/config/Models');
const userRoutes = require('./routes/UserRoutes');
const eventRoutes = require('./routes/EventRoutes');
const hardwareRoutes = require('./routes/HardwareRoutes');
const sponsorRoutes = require('./routes/SponsorRoutes');
const teamRoutes = require('./routes/TeamRoutes');

const uploadRoutes = require('./routes/UploadRoutes');

const auditLogRoutes = require('./routes/AuditLogRoutes');
const app = express();
const { authMiddleware } = require('./util/JWTUtil');

// CORS configuration
const corsOptions = {
  origin: process.env.CORS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Use your routes
app.use('/user', userRoutes)
app.use('/event', eventRoutes)
app.use('/hardware', hardwareRoutes)
app.use('/teams', teamRoutes);
app.use('/audit-logs', auditLogRoutes);
// Sponsor Routes
app.use('/sponsors', sponsorRoutes);
app.use('/api/eventsponsors', sponsorRoutes);

app.use("/api", uploadRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// Database + server start
const port = process.env.APP_PORT || 3000;
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      // Sync only in non-test environments
      //This line of code shouldn't be needed anymore since migrations are being used
      //await sequelize.sync({ alter: true });
      await sequelize.authenticate();
      attachAuditHooks();
      console.log('✅ Database authenticated successfully.');
    }
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Error authenticating the database:', err);
    process.exit(1); // optional: stop server if DB fails
  }
}

module.exports = app;

if(require.main === module){
  startServer();
}