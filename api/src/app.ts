import express, { Request, Response } from 'express';

import cors from 'cors';

import accountRoutes from './routes/account.route';
import domainRoutes from './routes/domain.route';
import randomRoutes from './routes/random.route';

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
  res.json({ msg: 'API working.' });
});

app.use('/api/account', accountRoutes);
app.use('/api/domain', domainRoutes);
app.use('/api/random', randomRoutes);

export default app;
