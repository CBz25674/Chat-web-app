const conn = require("./connection");
const request = require("./requestFriendDB")

module.exports = (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    let sqlQuery = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `username` = ?";
    conn.query(sqlQuery, [req.params.username], async (error, result, field) => {
        if (result.length == 0) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }
        let friendStatus = "no";
        let isFriend = await request.findOne({ $or: [
            {
                senderId: result[0].username,
                recieverId: req.session.user.username,
                status: 1
            },
            {
                senderId: req.session.user.username,
                recieverId: result[0].username,
                status: 1
            }
        ]
            
        });
        let isSender = await request.find({
            senderId: req.session.user.username,
            recieverId: result[0].username,
        })
        let isReciever = await request.find({
            senderId: result[0].username,
            recieverId: req.session.user.username,
        })
        if (result[0].username == req.session.user.username) friendStatus = "self";
        else if (isFriend) friendStatus = "yes";
        else if (isSender.length > 0 || isReciever.length > 0) {
            friendStatus = (isSender.length > 0) ? "sending" : "recieving"
        }
        res.render(`profile`, {
            profile: {
                username: result[0].username,
                displayname: result[0].displayname,
                avatar: result[0].avatar
            },
            status: friendStatus
        });
    })
}