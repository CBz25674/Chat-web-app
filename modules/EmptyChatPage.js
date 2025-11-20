const conn = require("./connection");
const request = require("./requestFriendDB");

module.exports = async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const friend = await request.find({ $or: [
        {
            senderId: req.session.user.username,
            status: 1
        }, 
        {
            recieverId: req.session.user.username,
            status: 1
        }
    ]}).select("recieverId senderId").exec();
    const friendUser = friend.map(f => {
        return [f.recieverId, f.senderId]
    }).flat();
    let connection;
    try {
        connection = await conn.getConnection();
        const friendSql = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `username` IN (?) AND `username` != ?";
        connection.execute(friendSql, [friendUser, req.session.user.username], (e, re, fd) => {
            res.render("message", {
                pair: null,
                friend: re
            })
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
}