const conn = require("./connection");
const request = require("./requestFriendDB");

module.exports = async (req, res, next) => {
    if (!req.session.user) return res.redirect("/login");
    const checkFriend = await request.find({ $or: [
        {
            senderId: req.session.user.username,
            recieverId: req.params.username,
            status: 1
        }, 
        {
            recieverId: req.session.user.username,
            senderId: req.params.username,
            status: 1
        }
    ]})
    if (checkFriend.length == 0) return res.redirect("/");
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
            const pairQuery = "SELECT `username`, `displayname`, `avatar`, `publickey` FROM `account` WHERE `username` = ?";
            connection.execute(pairQuery, [req.params.username], (error, result, fields) => {
                if (result == undefined || result.length == 0) return res.redirect("/");
                if (re == undefined) re = [];
                req.session.pairKey = result[0].publickey
                res.render("message", {
                    pair: result[0],
                    friend: re
                })
            })
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
    next();
}