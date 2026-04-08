import mongoose from "mongoose";

const connectMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("db connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};
export default connectMongoDb;
