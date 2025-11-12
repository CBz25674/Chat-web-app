const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

mongoose.connect(process.env.mongoDB).then(() => {
    console.log("Connected to ChatDB");
});

const schema = new mongoose.Schema({
    sender: String,
    reciever: String,
    msgId: { type: Number, unique: true },
    content: Object,
    createAt: Date
});

schema.plugin(AutoIncrement, {
    inc_field: "msgId"
})

const message = mongoose.model("message", schema);

module.exports = message;