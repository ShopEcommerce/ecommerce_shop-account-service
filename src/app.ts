import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { errorHandler, NotFoundError, correlationId, currentUser } from '@teleshop/common';
import { accountRouter } from './modules/account/account.route';

const app = express();

app.set('trust proxy', true);

app.use(
  cors({
    origin: true, 
    credentials: true, 
  })
);

app.use(express.json());

app.use(correlationId as unknown as RequestHandler);

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production', 
  })
);

app.use(currentUser as unknown as RequestHandler);

app.use('/api/account', accountRouter);

app.all(/.*/, () => {
  throw new NotFoundError();
});

app.use(errorHandler as unknown as ErrorRequestHandler);

export { app };