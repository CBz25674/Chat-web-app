const conn = require("../connection");
const bcrypt = require("bcrypt");

module.exports = (data) => {
    bcrypt.hash(data.newPassword, 10, async (e, hash) => {
        let connection;
        try {
            connection = await conn.getConnection();
            let editQuery = "UPDATE `account` SET `password`=? WHERE `username`=?";
            connection.execute(editQuery, [hash, data.username], (error, res) => {
                if (error) throw error;
            });
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) connection.release();
        }
    });
    return;
};