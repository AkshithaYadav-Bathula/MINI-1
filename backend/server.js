// const express = require('express');
// const app = express();
// const apiRoutes = require('./routes/api');
// const cors = require('cors');

// app.use(cors()); // allow frontend to connect
// app.use(express.json());
// app.use('/api', apiRoutes);

// // start server
// app.listen(5000, () => {
//   console.log('Server running on http://localhost:5000');
// });

const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create necessary directories if they don't exist
const dirs = [
  './public',
  './public/images',
  './public/images/uploads',
  './public/images/processed',
  './public/images/roi',
  './public/images/nroi',
  './public/images/qr',
  './public/images/watermarked',
  './public/images/extracted'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;