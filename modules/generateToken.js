const crypto = require("crypto")

const generate = (cmd, data = {}) => {
    let expire = new Date(Date.now() + (3600 * 1000)) //เวลาหมดอายุ = เวลาตอนนี้ + 1 ชั่วโมง
    return {
        token: crypto.randomUUID(),
        action: cmd,
        dataJSON: JSON.stringify(data),
        status: 1,
        expireDate: expire.toISOString().slice(0, 19).replace("T", " ")
    }
};

module.exports = generate;