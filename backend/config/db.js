import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let connUri = process.env.MONGO_URI;

    // Standard local check or fallback
    if (!connUri || connUri.includes('localhost') || connUri.includes('127.0.0.1')) {
      console.log('Attempting to connect to local MongoDB database...');
      try {
        // Try connecting with a very short timeout so we fallback quickly
        const conn = await mongoose.connect(connUri || 'mongodb://127.0.0.1:27017/mireakart', {
          serverSelectionTimeoutMS: 2000
        });
        console.log(`MongoDB Connected locally: ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.log('Local MongoDB not detected. Booting self-contained In-Memory Mongoose Database server...');
        mongod = await MongoMemoryServer.create();
        connUri = mongod.getUri();
      }
    } else {
      console.log('Attempting connection to remote Atlas Cloud Cluster...');
      try {
        const conn = await mongoose.connect(connUri, {
          serverSelectionTimeoutMS: 4000
        });
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        return;
      } catch (atlasErr) {
        console.log('Atlas Cloud connection failed. Booting self-contained In-Memory Mongoose Database server...');
        mongod = await MongoMemoryServer.create();
        connUri = mongod.getUri();
      }
    }

    const conn = await mongoose.connect(connUri);
    console.log(`In-Memory MongoDB Active & Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Critical Database Error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (e) {}
};

export default connectDB;
