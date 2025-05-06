const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (error) {
    console.log(error);
  }
}

export default dbConnect;
