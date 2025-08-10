import express from 'express';
import cors from 'cors';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import routes from './routes';

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (req, res) => res.send('Hello — Express + Prisma!'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1', routes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
