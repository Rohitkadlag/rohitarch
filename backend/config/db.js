// config/db.js
const mongoose = require("mongoose");
const config = require("config");
const env = require("dotenv");
env.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Removed: useCreateIndex: true, useFindAndModify: false
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
