const mailer = require("./mailer");
const conn = require("./connection");
const generate = require("../modules/generateToken");
const storeToken = require("../modules/storeToken");

module.exports = async (req, res) => {
    if (!req.body.username) { //ถ้าผู้ใช้ไม่กรอก username หรือ email ให้ย้อนกลับไปหน้าเดิม
        req.flash("error", "Please enter username or email.");
        return res.redirect("/forget-password");
    }
    //ค้นหา username หรือ email ตามที่กรอกมา
    let connection;
    try {
        connection = await conn.getConnection();
        let sqlQuery = `SELECT * FROM \`account\` WHERE \`email\` = ? OR \`username\` = ?`;
        connection.execute(sqlQuery, [req.body.username, req.body.username], async (err, result, field) => {
            if (err) throw err;
            if (result.length == 0) { //ถ้าค้นหาไม่เจอให้ย้อนกลับมาหน้าเดิม
                req.flash("error", "User not found");
                return res.redirect("/forget-password");
            }
            if (req.flash("error").length > 0) return;
            //สร้าง token สำหรับกู้บัญชี พร้อมทั้งเก็บ username ที่หาเจอไว้ใน token
            const token = generate("resetPassword", {
                username: result[0].username
            });
            storeToken(token);
            //ส่ง email ให้ผู้ใช้ (ตาม email ของ username ที่หาเจอ) พร้อมทั้งแนบลิ้งสำหรับใช้ token 
            const info = await mailer.sendMail({
                from: process.env.email,
                to: result[0].email,
                subject: "Account Recovery",
                html: `<div style=\"margin: 0px; padding: 10px: background-color: rgb(226, 230, 230);\">
                    <p style=\"margin: auto;\">Please click this button to recover your account.</p><br>
                    <a style=\"margin: auto; text-decoration: none; color: #FFFFFF; background-color: rgb(71, 71, 228); border-radius: 10px; text-align: center; padding: 5px 15px;\" href=\"http://${process.env.webDomain}/user/recover/${token.token}\">Reset Password</a>
                </div>`
            });
            
            req.flash("msg", `Email has been sent to ${result[0].email}. Please check your email to continue`);
            res.redirect("/");
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release()
    }
};