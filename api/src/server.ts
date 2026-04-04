import dotenv from 'dotenv';

import app from './app';

dotenv.config();

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('Environment variables are not defined.');
}

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
