import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { router as userRouter } from './auth/router.js';
import { router as eventRouter } from './events/event-routes.js';
import { isInvalid } from './lib/template-helpers.js';

dotenv.config();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    maxAge: 20 * 1000, // 20 sek
  })
);

app.locals = {
  isInvalid,
};

app.get('/', (req, res) =>
  res.json({
    _links: {
      users: '/users',
      events: '/events',
    },
  })
);
app.use('/events', eventRouter);
app.use('/users', userRouter);

/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  const title = 'Síða fannst ekki';
  res.status(404).json({
    error: title,
  });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).json({
    error: title,
  });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
