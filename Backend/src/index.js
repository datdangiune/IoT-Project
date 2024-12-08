const express = require('express');
const cors = require('cors');
const { PORT } = require('./configs/config');
const { connectRealtimeDatabase } = require('./configs/firebase-realtime.config');
const errorHandler = require('./middlewares/error-handler.middlewares');
const corsConfig = require('./configs/cors.config');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

connectRealtimeDatabase();

app.use('/api', require('./routes'));

// Add the /ping route directly in index.js
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server starting on http://localhost:${PORT}`);
});