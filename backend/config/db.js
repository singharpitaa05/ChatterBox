// DATABASE CONNECTION SETUP

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ ChatterBox Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to ChatterBox DataBase: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;