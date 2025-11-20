const mailer = require("./mailer");
const conn = require("./connection");
const generate = require("../modules/generateToken");
const storeToken = require("./storeToken");
const bcrypt = require("bcrypt"); 

module.exports = async (req, res) => {
    req.flash("prevForm", req.body);
    if (!req.body.email || !req.body.password) { //ถ้าผู้ใช้ไม่กรอก email ให้ย้อนกลับไปหน้าเดิม
        req.flash("error", "Please enter your new information.");
        return res.redirect("/edit/email");
    }

    let emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailFormat.test(req.body.email)) {
        req.flash("error", "Invalid email format.");
        return res.redirect("/edit/email");
    }

    let connection;
    try {
        connection = await conn.getConnection();
        connection.execute("SELECT `password` FROM `account` WHERE `username`=?", [req.session.user.username], (error, result, field) => {
            bcrypt.compare(req.body.password, result[0].password, (correct) => {
                if (!correct) {
                    req.flash("error", "Inconrect password");
                    return res.redirect("/edit/email");
                }
                //ค้นหา email ที่กรอกว่ามีคนใช้แล้วหรือยัง
                let sqlQuery = `SELECT * FROM \`account\` WHERE \`email\` = ?`;
                connection.execute(sqlQuery, [req.body.email], async (err, result, field) => {
                    if (err) throw err;
                    if (result.length > 0) { //email ที่กรอกมามีคนใช้แล้ว
                        req.flash("error", "This email is already used. Please try another email.");
                        return res.redirect("/edit/email");
                    }
                    //สร้าง token พร้อมทั้งเก็บ username และ email ใหม่ไว้ใน token
                    const token = generate("changeEmail", {
                        username: req.session.user.username,
                        newEmail: req.body.email
                    });
                    storeToken(token);
                    //ส่ง email ให้ผู้ใช้ พร้อมทั้งแนบลิ้งสำหรับใช้ token
                    const info = await mailer.sendMail({
                        from: process.env.email,
                        to: req.body.email,
                        subject: "Email Authentication",
                        html: `<div style=\"margin: 0px; padding: 10px: background-color: rgb(226, 230, 230);\">
                            <p style=\"margin: auto;\">Please click this button to confirm change</p><br>
                            <a style=\"margin: auto; text-decoration: none; color: #FFFFFF; background-color: rgb(71, 71, 228); border-radius: 10px; text-align: center; padding: 5px 15px;\" href=\"http://${process.env.webDomain}/token/${token.token}\">Confirm</a>
                        </div>`
                    });

                    req.flash("msg", `Email has been sent to ${req.body.email}. Please check your email to continue`);
                    res.redirect("/account");
                });
            })
        })
    } catch (err) {
        console.error(err)
    } finally {
        if (connection) connection.release();
    }
    
};