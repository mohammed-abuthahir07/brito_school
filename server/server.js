require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const adminRoutes = require('./admin/routes/adminAuthRoutes');
const adminForgetpasswordRoutes = require('./admin/routes/adminForgetpasswordRoutes');
const announcementRoutes = require('./admin/routes/announcementRoutes');
const calendarRoutes = require('./admin/routes/calendarRoutes');
const thirukkuralRoutes = require('./admin/routes/thirukkuralRoutes');
const galleryRoutes = require("./admin/routes/galleryRoutes");
const profileRoutes = require("./admin/routes/profileRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// admin api
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminForgetpasswordRoutes);
app.use('/api/admin', announcementRoutes);
app.use('/api/admin', calendarRoutes);
app.use('/api/admin', thirukkuralRoutes);
app.use("/api/admin", galleryRoutes);
app.use("/api/admin", profileRoutes);

// 2. Start Server and Test MySQL Connection in Terminal
const StartServer = () => app.listen(PORT, async () => {
    console.log(`🚀 Brito School Express Server running on port ${PORT}`);
    
    // Terminal DB Connection Test
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release(); // release connection back to pool
    } catch (error) {
        console.error('❌ MySQL Database Connection Failed:', error.message);
    }
});

StartServer();