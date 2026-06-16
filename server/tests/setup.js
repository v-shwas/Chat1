import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const setupFilePath = fileURLToPath(import.meta.url);
const setupDir = path.dirname(setupFilePath);

process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(setupDir, "..", ".cache", "mongodb-binaries");

let mongod;

// Start in-memory MongoDB before all tests in this suite
export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

// Drop collections between tests to isolate state
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Disconnect and stop server after all tests
export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};
