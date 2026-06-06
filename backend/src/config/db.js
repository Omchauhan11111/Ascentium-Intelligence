const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy backend/.env.example -> backend/.env and fill it in.');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[db] Connected to MongoDB -> ${mongoose.connection.host}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB error:', err.message);
});

module.exports = { connectDB, mongoose };
