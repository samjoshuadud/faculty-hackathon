const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    const connection = mongoose.connection;

    console.log(`Connected to database: ${connection.name}`);
    console.log(`Available collections: ${Object.keys(connection.collections).join(', ')}`);
  } catch (error) {
    console.log(error);
  }
}

export default dbConnect;
