const conn = require("./connection");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
    req.flash("prevForm", req.body);
    if (!req.body.password || !req.body.repassword) {
        req.flash("error", "Please enter your new password.");
        return res.redirect(`/user/recover/${req.params.token}`);
    }
    //เช็คว่ารหัสผ่านที่ตั้งปลอดภัยหรือไม่
    let passwordFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!passwordFormat.test(req.body.password)) { //ถ้ารหัสผ่านไม่ปลอดภัย ให้ย้อนมาหน้าเดิม
        req.flash("error", "Invalid password format. Please try another password.");
        return res.redirect(`/user/recover/${req.params.token}`);
    }
    if (req.body.password != req.body.repassword) {
        req.flash("error", "Password does not match.");
        return res.redirect(`/user/recover/${req.params.token}`);
    }
    const timeNow = new Date(Date.now());
    let connection;
    try {
        connection = await conn.getConnection();
        let searchToken = `SELECT * FROM \`onetimetoken\` WHERE \`token\` = ? AND \`status\` = 1 AND \`expire\` >= ? AND \`action\` = "resetPassword"`;
        connection.execute(searchToken, [req.params.token, timeNow.toISOString().slice(0, 19).replace("T", " ")], (error, result, field) => {
            if (error) throw error;
            if (result.length == 0) {
                req.flash("error", "Token is not available");
                return res.redirect("/");
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                //เปลี่ยนรหัสผ่านให้ผู้ใช้
                let sqlQuery = `UPDATE \`account\` SET \`password\`= ? WHERE \`username\` = ?`;
                connection.execute(sqlQuery, [hash, JSON.parse(result[0].data).username]);
                //ปิด token ไม่ให้ใช้ซ้ำได้
                connection.execute(`UPDATE \`onetimetoken\` SET \`status\` = '0' WHERE \`onetimetoken\`.\`id\` = ?`, [result[0].id]);
                
                req.flash("msg", "Your password has been reset. Please log in again.")
                res.redirect(`/login`);
            });
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
};