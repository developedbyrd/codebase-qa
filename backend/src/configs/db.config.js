import mongoose from "mongoose";
import {
  DB_MAX_POOL_SIZE,
  DB_SERVER_SELECTION_TIMEOUT,
  DB_SOCKET_TIMEOUT,
  DB_CONNECT_TIMEOUT,
} from "../utils/constants.util.js";

const options = {
  maxPoolSize: DB_MAX_POOL_SIZE,
  serverSelectionTimeoutMS: DB_SERVER_SELECTION_TIMEOUT,
  socketTimeoutMS: DB_SOCKET_TIMEOUT,
  connectTimeoutMS: DB_CONNECT_TIMEOUT,
};

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
