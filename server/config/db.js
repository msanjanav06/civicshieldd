import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicshield';
  
  try {
    logger.info(`Attempting to connect to MongoDB at: ${uri}`);
    // Attempt standard connection with a short timeout to failover quickly if no local mongod
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    logger.info(`Connected successfully to live MongoDB instance: ${mongoose.connection.host}`);
    return;
  } catch (liveErr) {
    logger.warn(`Could not connect to live MongoDB (${liveErr.message}). Initiating embedded MongoDB in-memory database...`);
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    logger.info(`In-memory MongoDB initialized at: ${memUri}`);

    await mongoose.connect(memUri);
    logger.info('Connected successfully to CivicShield embedded in-memory database.');
  } catch (memErr) {
    logger.error('Failed to initialize embedded MongoDB database:', memErr);
    throw memErr;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
