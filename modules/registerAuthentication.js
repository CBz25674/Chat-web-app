const mailer = require("./mailer");
const conn = require("./connection");
const generate = require("../modules/generateToken");
const storeToken = require("../modules/storeToken");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
    req.flash("prevForm", req.body);
    if (!req.body.email || !req.body.username || !req.body.password || !req.body.repassword) { //ปิด token ไม่ให้ใช้ซ้ำได้
        req.flash("error", "Please provide your information.");
        return res.redirect("/register");
    }
    let usernameFormat = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/;
    if (!usernameFormat.test(req.body.username)) {
        req.flash("error", "Username format is not correct.");
        return res.redirect("/register");
    }
    //เช็คว่าช่อง email ที่กรอกเป็น email หรือไม่ (ต้องมี @ ตามด้วยโดเมน เช่น @gmail.com หรือ @pccm.ac.th)
    let emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailFormat.test(req.body.email)) {
        req.flash("error", "Invalid email format.");
        return res.redirect("/register");
    }
    //เช็คว่ารหัสผ่านที่ตั้งปลอดภัยหรือไม่
    let passwordFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!passwordFormat.test(req.body.password)) {
        req.flash("error", "Invalid password format. Please try another password.");
        return res.redirect("/register");
    }
    if (req.body.password != req.body.repassword) {
        req.flash("error", "Password does not match.");
        return res.redirect("/register");
    }
    //เช็คว่า username หรือ email ซ้ำหรือไม่
    let connection;
    try {
        connection = await conn.getConnection();
        let sqlQuery = `SELECT * FROM \`account\` WHERE \`email\` = ? OR \`username\` = ?`;
        connection.execute(sqlQuery, [req.body.email, req.body.username], (err, result, field) => {
            if (err) throw err;
            if (result.length > 0) {
                req.flash("error", "Username or email is already used.");
                return res.redirect("/register");
            }
            if (req.flash("error").length > 0) return;
            //สร้าง token พร้อมทั้งเก็บข้อมูลไว้ใน token
            bcrypt.hash(req.body.password, 10, async (e, hash) => {
                const token = generate("register", {
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                });
                storeToken(token);

                //ส่ง email ให้ผู้ใช้ พร้อมทั้งแนบลิ้งสำหรับใช้ token
                const info = await mailer.sendMail({
                    from: process.env.email,
                    to: req.body.email,
                    subject: "Register Authentication",
                    html: `<div style=\"margin: 0px; padding: 10px: background-color: rgb(226, 230, 230);\">
                        <p style=\"margin: auto;\">Please click this button to register.</p><br>
                        <a style=\"margin: auto; text-decoration: none; color: #FFFFFF; background-color: rgb(71, 71, 228); border-radius: 10px; text-align: center; padding: 5px 15px;\" href=\"http://${process.env.webDomain}/token/${token.token}\">Register</a>
                    </div>`
                });

                req.flash("msg", `Email has been sent to ${req.body.email}. Please check your email to continue`);
                res.redirect("/register");
            })    
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
};