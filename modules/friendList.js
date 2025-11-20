const request = require("./requestFriendDB");
const conn = require("./connection");

module.exports = async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    try {
        const pendingRequest = await request.find({
            senderId: req.session.user.username,
            status: 0
        }).select("recieverId").exec();
        const pendingUser = pendingRequest.map(user => user.recieverId);
        let connection;
        try {
            connection = await conn.getConnection();
            const pendingSql = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `username` IN (?)";
            connection.execute(pendingSql, pendingUser, async (error, result, field) => {
                const getRequest = await request.find({
                    recieverId: req.session.user.username,
                    status: 0
                }).select("senderId").exec();
                const user = getRequest.map(u => u.senderId);
                connection.execute(pendingSql, user, async (err, result2, fld) => {
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
                    const friendSql = "SELECT `username`, `displayname`, `avatar` FROM `account` WHERE `username` IN (?) AND `username` != ?";
                    connection.execute(friendSql, [friendUser, req.session.user.username], (e, result3, fd) => {
                        if (result == undefined) result = [];
                        if (result2 == undefined) result2 = [];
                        if (result3 == undefined) result3 = [];
                        res.render("friendList", {
                            pending: result,
                            recieving: result2,
                            friend: result3
                        })
                    })
                })
            })
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) connection.release();
        }
    } catch (error) {

    }
}