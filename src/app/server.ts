import dotenv from 'dotenv';
import app from './app';
import config from './config';
import prisma from './lib/prisma';

dotenv.config();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }

  const port = Number(config.PORT ?? 5000);
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main();
