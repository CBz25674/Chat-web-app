const conn = require("./connection");

module.exports = (req, res) => {
    let sqlQuery = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `displayname` = ? OR `username` = ?";
    conn.query(sqlQuery, [req.body.search, req.body.search], (error, result, field) => {
        if (result.length == 0) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }
        res.redirect(`/profile/${result[0].username}`);
    })
}