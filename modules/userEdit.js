const conn = require("./connection");

module.exports = async (req, res) => {
    let connection;
    try {
        connection = await conn.getConnection();
        let sqlQuery = `SELECT * FROM \`account\` WHERE username = ?`;
        connection.execute(sqlQuery, [req.session.user.username], (err, result, field) => {
            if (err) throw err;
            if (req.flash("error").length > 0) return;
            if (req.body.displayname) { //ถ้าผู้ใช้กรอกชื่อเล่นใหม่ให้เปลี่ยนชื่อเล่นให้ผู้ใช้
                let dNameQuery = `UPDATE \`account\` SET \`displayname\`= ? WHERE \`username\` = ?`
                connection.execute(dNameQuery, [req.body.displayname, req.session.user.username], (e, res, fld) => {
                    if (e) throw e;
                });
                req.session.user.displayname = req.body.displayname;
            }
            if (req.file) {
                let avatarQuery = `UPDATE \`account\` SET \`avatar\`= ? WHERE \`username\` = ?`
                connection.execute(avatarQuery, [req.file.path.replace("public\\", ""), req.session.user.username], (e, res, fld) => {
                    if (e) throw e;
                });
                req.session.user.avatar = req.file.path.replace("public\\", "");
            }
            
            res.redirect("/account");
        })
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
}