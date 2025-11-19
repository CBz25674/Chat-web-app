const express = require("express");
const http = require("http");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const app = express();
const server = http.createServer(app);
require("dotenv").config();

//Modules
const conn = require("./modules/connection");


//Middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUnintiialized: false,
    cookie: { maxAge: 21600 * 1000 }
}));
app.use(flash());
app.use((req, res, next) => {
    app.locals.errors = req.flash("error");
    next();
});
app.use((req, res, next) => {
    app.locals.messages = req.flash("msg");
    next();
});
app.use((req, res, next) => {
    app.locals.loggedin = req.session.user;
    next();
});

//General Pages
app.get("/", (req, res) => {
    res.render("home");
});

//Login and register system
const registerAuth = require("./modules/registerAuthentication");
const loginSystem = require("./modules/login");
const logoutSystem = require("./modules/logout");

app.get("/login", (req, res) => {
    if (req.session.user) return res.redirect("/");
    let username = "";
    let data = req.flash("prevForm")[0];
    if (typeof data != "undefined") username = data.username;
    res.render("login", { username: username });
});
app.get("/register", (req, res) => {
    if (req.session.user) return res.redirect("/");
    let username = "";
    let email = "";
    let password = "";
    let data = req.flash("prevForm")[0];
    if (typeof data != "undefined") {
        username = data.username;
        email = data.email;
        passowrd = data.password;
    }
    res.render("register", {
        username: username,
        email: email,
        password: password
    });
});
app.get("/forget-password", (req, res) => {
    if (req.session.user) return res.redirect("/");
    res.render("forgetPassword");
});
app.get("/user/logout", logoutSystem);
app.post("/user/register", registerAuth);
app.post("/user/login", loginSystem);

//Account recovery and authentication
const userSearch = require("./modules/userSearch");
const userRecovery = require("./modules/userRecovery");
const resetPassword = require("./modules/resetPassword");

app.get("/user/recover/:token", userRecovery);
app.post("/user/search", userSearch);
app.post("/user/reset/:token", resetPassword);

//Custom profile system
const changePassword = require("./modules/changePassword");
const userEdit = require("./modules/userEdit");
const userEditEmail = require("./modules/userEditEmail");
const uploadAvatar = require("./modules/uploadFile");

app.get("/account", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("account");
});
app.get("/edit", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("userEdit");
});
app.get("/edit/email", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    let email = "";
    let data = req.flash("prevForm")[0];
    if (typeof data != "undefined") {
        email = data.email;
    }
    res.render("userEditEmail", {
        email: email
    });
});
app.get("/user/edit/password", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    let password = "";
    let rePassword = "";
    let data = req.flash("prevForm")[0];
    if (typeof data != "undefined") {
        password = data.newPassword;
        rePassword = data.rePassword
    }
    res.render("userEditPassword", {
        password: password,
        rePassword: rePassword
    });
})
app.post("/user/change/password", changePassword)
app.post("/user/edit", uploadAvatar.single('avatar'), userEdit);
app.post("/user/edit/email", userEditEmail);

//Search user and profile page
const findFriend = require("./modules/findFriends");
const ShowProfile = require("./modules/ShowProfile");

app.post("/find", findFriend);
app.get("/profile/:username", ShowProfile);

//Using token (One-time-used token)
const activateToken = require("./modules/activateToken");

app.get("/token/:token", activateToken);

//Friend Request System
const requestSystem = require("./modules/requestSystem");
const friendList = require("./modules/friendList");

app.get("/friend", friendList);
app.post("/request", requestSystem);
app.get("/re", async (req, res) => {
    await message.deleteMany({});
    res.redirect("/")
})

//Chat Server
const { Server } = require("socket.io");
const io = new Server(server);
const chatPage = require("./modules/chatPage")
const EmptyChatPage = require("./modules/EmptyChatPage");
const crypto = require("crypto");
const message = require("./modules/chatDB");

app.get("/chat/:username", chatPage, (req, res) => {
    io.once("connection", (socket) => {
        console.log(`${socket.id} is online`);
        socket.on("joinRoom", async (room) => {
            socket.rooms.forEach(rm => {
                if (rm !== socket.id) {
                    socket.leave(rm)
                    console.log(`${socket.id} leave ${rm}`);
                }
            })
            socket.join(room);
            console.log(`${socket.id} joined ${room}`)
            io.to(room).emit("joinedRoom", room);
            const chatHistory = await message.find({ $or: [
                {
                    sender: req.session.user.username,
                    reciever: req.params.username
                }, {
                    sender: req.params.username,
                    reciever: req.session.user.username
                }
            ]}).sort({ msgId: 1 });
            chatHistory.forEach(chat => {
                if (chat.sender == req.session.user.username) {
                    const decrypt = crypto.publicDecrypt({
                        key: req.session.pairKey
                    }, Buffer.from(chat.content.toSender, "base64"));
                    console.log(decrypt)
                    io.to(socket.id).emit("msg", {
                        from: chat.sender,
                        to: chat.reciever,
                        content: decrypt.toString()
                    });
                } else {
                    const decrypt = crypto.privateDecrypt({
                        key: req.session.user.key,
                        passphrase: process.env.keypassphrase,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: "sha256"
                    }, Buffer.from(chat.content.toReciever, "base64"));
                    io.to(socket.id).emit("msg", {
                        from: chat.sender,
                        to: chat.reciever,
                        content: decrypt.toString()
                    });
                }
            })
            console.log(chatHistory);
            socket.on("msg", (msg) => {
                const encryptToReciever = crypto.publicEncrypt({
                    key: req.session.pairKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256"
                }, Buffer.from(msg.content));

                conn.query("SELECT `privatekey` from `account` WHERE `username`=?", [msg.to], async (error, result, field) => {
                    const encryptToSender = crypto.privateEncrypt({
                        key: result[0].privatekey,
                        passphrase: process.env.keypassphrase
                    }, Buffer.from(msg.content));
                    try {
                        const messageData = new message({
                            sender: msg.from,
                            reciever: msg.to,
                            content: {
                                toSender: encryptToSender.toString("base64"),
                                toReciever: encryptToReciever.toString("base64")
                            },
                            createAt: Date.now()
                        })
                        await messageData.save();
                    } catch (err) {
                        console.error(err);
                    }
                })

                io.to(room).emit("msg", msg);
            })
        })
        
    })

});
app.get("/chat", EmptyChatPage);


//Run server
server.listen(3000, () => {
    console.log("Server online!");
});