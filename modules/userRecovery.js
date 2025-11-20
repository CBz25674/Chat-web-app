const conn = require("./connection");

module.exports = async (req, res) => {
    //หา token ที่ได้รับ (token ต้องยังไม่ถูกใช้ และยังไม่หมดอายุ) 
    let password = "";
    let repassword = "";
    let data = req.flash("prevForm")[0];
    if (typeof data != "undefined") {
        password = data.password;
        repassword = data.repassword;
    }
    const timeNow = new Date(Date.now());
    let connection;
    try {
        connection = await conn.getConnection();
        let searchToken = `SELECT * FROM \`onetimetoken\` WHERE \`token\` = ? AND \`status\` = 1 AND \`expire\` >= ? AND \`action\` = "resetPassword"`;
        connection.execute(searchToken, [req.params.token, timeNow.toISOString().slice(0, 19).replace("T", " ")], (error, result, field) => {
            if (error) throw error;
            //ถ้าไม่เจอ token ให้แสดงหน้า InvalidToken
            if (result.length == 0) {
                req.flash("error", "Token is not available");
                return res.redirect("/");
            }
            //ถ้าเจอ token ให้แสดงเป็นฟอร์มสำหรับเปลี่ยนรหัสผ่าน
            
            res.render("resetPassword", { 
                token: req.params.token,
                password: password,
                repassword: repassword
            });
        });
    } catch (err) {
        console.error(err)
    } finally {
        if (connection) connection.release();
    }
    
}