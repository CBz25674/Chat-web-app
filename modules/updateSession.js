const conn = require("./connection");

module.exports = async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    let connection;
    try {
        connection = await conn.getConnection();
        connection.execute("SELECT * FROM `account` WHERE `username` = ?", [req.session.user.username], (error, result, field) => {
            req.session.user = {
                username: result[0].username,
                displayname: result[0].displayname,
                email: result[0].email,
                avatar: result[0].avatar,
                key: result[0].privatekey
            }
        })
        req.flash("msg", "Your information is updated.");
        res.redirect("/")
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
}