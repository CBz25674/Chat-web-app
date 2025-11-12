const conn = require("../connection");
const bcrypt = require("bcrypt");

module.exports = (data) => {
    bcrypt.hash(data.newPassword, 10, (e, hash) => {
        let editQuery = "UPDATE `account` SET `password`=? WHERE `username`=?";
        conn.query(editQuery, [hash, data.username], (error, res) => {
            if (error) throw error;
        });
    });
    return;
};