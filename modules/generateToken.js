const uuid = require("uuid");

const generate = (cmd, data = {}) => {
    let expire = new Date(Date.now() + (3600 * 1000)) //เวลาหมดอายุ = เวลาตอนนี้ + 1 ชั่วโมง
    return {
        token: uuid.v4(),
        action: cmd,
        dataJSON: JSON.stringify(data),
        status: 1,
        expireDate: expire.toISOString().slice(0, 19).replace("T", " ")
    }
};

module.exports = generate;