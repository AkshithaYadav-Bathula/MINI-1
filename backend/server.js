const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');
const cors = require('cors');

app.use(cors()); // allow frontend to connect
app.use(express.json());
app.use('/api', apiRoutes);

// start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
