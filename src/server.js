require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');
const { router: authRouter } = require('./auth');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Init DB
initDB();

// API routes
app.use('/api/auth', authRouter);
app.use('/api', apiRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`WolfMindset corriendo en puerto ${PORT}`);
});
