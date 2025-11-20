const conn = require("./connection");

module.exports = async (req, res, next) => {
    //หา token ที่ได้รับ (token ต้องยังไม่ถูกใช้ และยังไม่หมดอายุ) 
    const timeNow = new Date(Date.now());
    let connection;
    try {
        connection = await conn.getConnection();
        let searchToken = `SELECT * FROM \`onetimetoken\` WHERE \`token\` = ? AND \`status\` = 1 AND \`expire\` >= ?`;
        connection.execute(searchToken, [req.params.token, timeNow.toISOString().slice(0, 19).replace("T", " ")], (error, result, field) => {
            if (error) throw error;
            if (result.length == 0) {
                req.flash("error", "Token is not available");
                return res.redirect("/");
            }
            
            //เรียกใช้ file ตาม action ของ token
            const action = require(`./action/${result[0].action}`);
            
            action(JSON.parse(result[0].data));
            if (result[0].action == "register") {
                req.flash("msg", "Registered successfully. Please login.")
            }
            
            //ปิด token ไม่ให้ใช้ซ้ำได้
            connection.execute(`UPDATE \`onetimetoken\` SET \`status\` = '0' WHERE \`onetimetoken\`.\`id\` = ?`, [result[0].id]);
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
    next()
}