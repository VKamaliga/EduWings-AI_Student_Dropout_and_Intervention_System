const mongoose = require('mongoose');
let mongod = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (isProduction && !uri) {
    console.error('❌ [FATAL] MONGO_URI is required in production environment.');
    console.error('Please configure MONGO_URI in your production environment variables (e.g., Render Dashboard).');
    process.exit(1);
  }

  const targetUri = uri || 'mongodb://127.0.0.1:27017/eduwings';

  try {
    // In production, allow sufficient timeout for cloud Atlas clusters (10s); in dev 2.5s for fast fallback
    const timeout = isProduction ? 10000 : 2500;
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: timeout,
    });
    console.log(`✅ Connected to external MongoDB database successfully.`);
  } catch (err) {
    if (isProduction) {
      console.error(`❌ [FATAL] Production MongoDB connection failed: ${err.message}`);
      console.error('Production requires a valid external MongoDB cluster (e.g. MongoDB Atlas). In-memory fallback is disabled in production.');
      process.exit(1);
    }

    console.warn(`⚠️ External MongoDB connection failed (${err.message}). Starting MongoMemoryServer for development fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'eduwings',
        },
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to embedded MongoMemoryServer at: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB fallback:', memErr.message);
      throw memErr;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDB };
