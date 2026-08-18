const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
  res.send('VoyageCraft API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
