const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const options = {
    // strictQuery was removed in Mongoose 8 — do not include it
    autoIndex: process.env.NODE_ENV === "development",
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    logger.info(
      `MongoDB connected: ${conn.connection.host} [${conn.connection.name}]`,
    );

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected — attempting reconnect...");
    });
    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB error: ${err.message}`);
    });
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
