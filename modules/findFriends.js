const conn = require("./connection");

module.exports = async (req, res) => {
    let connection;
    try {
        connection = await conn.getConnection();
        let sqlQuery = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `displayname` = ? OR `username` = ?";
        connection.execute(sqlQuery, [req.body.search, req.body.search], (error, result, field) => {
            if (result.length == 0) {
                req.flash("error", "User not found");
                return res.redirect("/");
            }
            res.redirect(`/profile/${result[0].username}`);
        })
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
}