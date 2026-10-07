const mongoose = require('mongoose');
let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduwings';
  
  try {
    // Attempt standard connection first with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ Connected to external MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ External MongoDB connection failed (${err.message}). Starting MongoMemoryServer...`);
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
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
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
