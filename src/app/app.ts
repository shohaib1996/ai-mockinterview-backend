import express from 'express';
import cors from 'cors';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import routes from './routes';
import config from './config';

const app = express();
app.use(express.json());

// `origin: '*'` is not valid together with `credentials: true` (browsers reject
// wildcard-origin credentialed requests), so allow only known, configured origins.
// Add production frontend URLs via the ALLOWED_ORIGINS env var (comma-separated).
const allowedOrigins = (
  config.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [
    config.BASE_URL,
    'http://localhost:3000',
  ]
).filter((o): o is string => !!o);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);

app.get('/', (req, res) => res.send('Hello — Express + Prisma!'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1', routes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
