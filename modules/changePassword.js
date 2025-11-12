const conn = require("./connection");
const bcrypt = require("bcrypt");
const generate = require("../modules/generateToken");
const storeToken = require("../modules/storeToken");
const mailer = require("./mailer");

module.exports = (req, res) => {
    req.flash("prevForm", req.body);
    if (!req.body.newPassword || !req.body.rePassword || !req.body.oldPassword) {
        req.flash("error", "Please enter password.");
        return res.redirect("/user/edit/password");
    }
    //เช็คว่ารหัสผ่านที่ตั้งปลอดภัยหรือไม่
    let passwordFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!passwordFormat.test(req.body.newPassword)) {
        req.flash("error", "Invalid password format. Please try another password.");
        return res.redirect("/user/edit/password");
    }
    if (req.body.newPassword != req.body.rePassword) {
        req.flash("error", "Password does not match.");
        return res.redirect("/user/edit/password");
    }
    let sqlQuery = "SELECT * FROM `account` WHERE `username` = ?";
    conn.query(sqlQuery, [req.session.user.username], (error, result, field) => {
        if (error) throw error;
        bcrypt.compare(req.body.oldPassword, result[0].password, async (err, correct) => {
            if (!correct) { //เช็คว่ารหัสผ่านถูกหรือไม่
                req.flash("error", "Incorrect Password");
                return res.redirect("/user/edit/password");
            }
            const token = generate("changePassword", {
                username: req.session.user.username,
                newPassword: req.body.newPassword
            })
            storeToken(token);
            //ส่ง email ให้ผู้ใช้ พร้อมทั้งแนบลิ้งสำหรับใช้ token
            const info = await mailer.sendMail({
                from: proccess.env.email,
                to: result[0].email,
                subject: "Change Password Confirmation",
                html: `<div style=\"margin: 0px; padding: 10px: background-color: rgb(226, 230, 230);\">
                    <p style=\"margin: auto;\">Please click this button to confirm change</p><br>
                    <a style=\"margin: auto; text-decoration: none; color: #FFFFFF; background-color: rgb(71, 71, 228); border-radius: 10px; text-align: center; padding: 5px 15px;\" href=\"http://${process.env.webDomain}/token/${token.token}\">Confirm</a>
                </div>`
            });

            req.flash("msg", `Email has been sent to ${result[0].email}. Please check your email to continue`);
            res.redirect("/");
        });
    })
}