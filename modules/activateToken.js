const conn = require("./connection");

module.exports = (req, res) => {
    //หา token ที่ได้รับ (token ต้องยังไม่ถูกใช้ และยังไม่หมดอายุ) 
    const timeNow = new Date(Date.now());
    let searchToken = `SELECT * FROM \`onetimetoken\` WHERE \`token\` = ? AND \`status\` = 1 AND \`expire\` >= ?`;
    conn.query(searchToken, [req.params.token, timeNow.toISOString().slice(0, 19).replace("T", " ")], (error, result, field) => {
        if (error) throw error;
        if (result.length == 0) {
            req.flash("error", "Token is not available");
            return res.redirect("/");
        }
        
        //เรียกใช้ file ตาม action ของ token
        const action = require(`./action/${result[0].action}`);
        
        //อัทเดทข้อมูลบนหน้าเว็ป
        action(JSON.parse(result[0].data));
        let newData = "SELECT * FROM `account` WHERE `username`=?";
        conn.query(newData, [JSON.parse(result[0].data).username], (err, re, fld) => {
            req.session.user = {
                username: re[0].username,
                displayname: re[0].displayname,
                email: re[0].email,
                avatar: re[0].avatar,
                key: re[0].privatekey
            };
        })
        
        //ปิด token ไม่ให้ใช้ซ้ำได้
        conn.query(`UPDATE \`onetimetoken\` SET \`status\` = '0' WHERE \`onetimetoken\`.\`id\` = ?`, [result[0].id]);

        res.redirect("/");
    });
    
}