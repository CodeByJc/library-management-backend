require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('./src/utils/logger');
const connectDB = require('./src/infrastructure/db');
const routes = require('./src/presentation/routes');
const { errorHandler } = require('./src/presentation/middlewares');

const app = express();

app.use(helmet());
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const stream = { write: message => winston.info(message.trim()) };
app.use(morgan('combined', { stream }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', apiLimiter);

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    winston.info(`Server running in Clean Architecture config on port ${PORT}`);
  });
});
