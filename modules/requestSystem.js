const request = require("./requestFriendDB");

module.exports = async (req, res) => {
    if (req.body.action == "unfriend") {
        try {
            const unfriend = await request.deleteOne({ $or: [
                {
                    senderId: req.body.user,
                    recieverId: req.session.user.username,
                    status: 1
                },
                {
                    senderId: req.session.user.username,
                    recieverId: req.body.user,
                    status: 1
                }]
            })
        } catch (error) {
            console.error(error);
        }
    }
    if (req.body.action == "cancelRequest") {
        try {
            const cancelRequest = await request.deleteOne({
                senderId: req.session.user.username,
                recieverId: req.body.user,
                status: 0
            })
        } catch (error) {
            console.error(error);
        }
    }
    if (req.body.action == "acceptRequest") {
        try {
            const UpdateRequest = await request.findOne({
                senderId: req.body.user,
                recieverId: req.session.user.username,
                status: 0
            });
            UpdateRequest.status = 1;
            await UpdateRequest.save();
        } catch (error) {
            console.error(error);
        }
    }
    if (req.body.action == "denyRequest") {
        try {
            const denyRequest = await request.deleteOne({
                senderId: req.body.user,
                recieverId: req.session.user.username,
                status: 0
            })
        } catch (error) {
            console.error(error);
        }
    }
    if (req.body.action == "addRequest") {
        try {
            const newRequest = new request({
                senderId: req.session.user.username,
                recieverId: req.body.user,
                status: 0,
                createAt: Date.now(),
                updateAt: Date.now()
            })
            await newRequest.save()
        } catch (error) {
            console.error(error);
        }
    }
    res.redirect("/profile/" + req.body.user)
}