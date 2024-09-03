require('dotenv').config();
const mongoose = require('mongoose');

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to Mongo Successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectToMongo;
