const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/admin.routes');
const sellerRoutes = require('./routes/seller.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Route middleware definitions
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
