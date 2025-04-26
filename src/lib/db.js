import mongose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure 
  }
}