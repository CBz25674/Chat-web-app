const mongoose = require("mongoose");

mongoose.connect(process.env.mongoDB).then(() => {
    console.log("Connected to MongoDB");
});

const schema = new mongoose.Schema({
    senderId: String,
    recieverId: String,
    status: Boolean,
    createAt: Date,
    updateAt: Date
});

const request = mongoose.model("request", schema);

module.exports = request;