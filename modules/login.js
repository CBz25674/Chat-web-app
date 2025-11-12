const conn = require("./connection");
const bcrypt = require("bcrypt");

module.exports = (req, res) => {
    req.flash("prevForm", req.body)
    if (!req.body.username || !req.body.password) { //ถ้าผู้ใช้กรอกข้อมูลไม่ครบ
        req.flash("error", "Please enter username and password.");
        return res.redirect("/login");
    }
    
    //ค้นหา username ที่กรอกมา
    let sqlQuery = `SELECT * FROM \`account\` WHERE username = ? OR email = ?`;
    conn.query(sqlQuery, [req.body.username, req.body.username], (err, result, field) => {
        if (err) throw err;
        if (result.length == 0) {
            req.flash("error", "Incorrect Username or Password");
            return res.redirect("/login");
        }

        bcrypt.compare(req.body.password, result[0].password, (err, correct) => {
            if (!correct) { //เช็คว่ารหัสผ่านถูกหรือไม่
                req.flash("error", "Incorrect Username or Password");
                return res.redirect("/login");
            }
            if (req.flash("error").length > 0) return;
            req.session.user = {
                username: result[0].username,
                displayname: result[0].displayname,
                email: result[0].email,
                avatar: result[0].avatar,
                key: result[0].privatekey
            };
            req.flash("msg", "Logged in successfully!");
            res.redirect("/account");
        });
    });
}